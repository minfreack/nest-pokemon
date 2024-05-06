import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly httpService: HttpService, 
    private readonly pokemonService: PokemonService)
     {}


  async executeSeed() {
    await this.pokemonService.removeAll();
    const {data} = await this.httpService.axiosRef.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    const pokemonsToInsert = [];
    data.results.forEach(async({name, url}) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
       pokemonsToInsert.push({name, no});
    });
    await this.pokemonService.createMany(pokemonsToInsert);
    return 'Seed executed successfully!';
    
  }
}
