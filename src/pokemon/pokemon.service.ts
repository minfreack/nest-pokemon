import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaultLimit: number;
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ) {
    this.defaultLimit = this.configService.get('defaultLimit');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon; 
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async createMany(createPokemonDto: CreatePokemonDto[]) {
    createPokemonDto.forEach(pokemon => {
      pokemon.name = pokemon.name.toLowerCase();
    });
    try {
      await this.pokemonModel.insertMany(createPokemonDto);
      return createPokemonDto;
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  findAll(paginationDto: PaginationDto) {
    const {limit = this.defaultLimit, offset = 0} = paginationDto;
    return this.pokemonModel.find()
      .skip(offset)
      .limit(limit)
      .sort({no: 1})
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    if(!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({no: term})
    }
    if(!pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term)
    }
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLowerCase().trim()})
    }
    if(!pokemon) throw new NotFoundException(`Pokemon with id, name or no ${term} not found`)
    return pokemon
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(term)
      if(updatePokemonDto.name){
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase()
      }
      await pokemon.updateOne(updatePokemonDto, {new: true})
      return {...pokemon.toJSON(), ...updatePokemonDto} 
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async remove(id: string) {
    const result = await this.pokemonModel.deleteOne({
      _id: id
    })
    if(result.deletedCount === 0) throw new NotFoundException(`Pokemon with id ${id} not found`)
    return;
  }

  async removeAll() {
    await this.pokemonModel.deleteMany({})
    return;
  }

  private handleExceptions(error: any){
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon already exists ${JSON.stringify(error.keyValue)}`)
    }
    throw new InternalServerErrorException('Cannot create pokemon at the moment. Server error.');
  }
}
