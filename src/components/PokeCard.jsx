import { useState, useEffect } from 'react'
import { getPokedexNumber } from '../utils'

export function PokeCard(props) {
    const { selectedPokemon } = props
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect( // useEffect is a way to set 'event listener function' that takes 2 inputs. 1. = callback func to be executed, whenever the event that we're listening for is triggered. 2. = dependency array, when its empty, callback func is called right after the page is fully loaded, or when the dependency array will change its value -> {() => {callBack function}, []}
        () => {

            // if loading => exit logic
            if (loading || !localStorage) return // gard close
            // check if the selected pokemon is available in the cche
            // 1. define the cache
            let cache = {}
            if (localStorage.getItem('pokedex')) {
                cache = JSON.parse(localStorage.getItem('pokedex'))
            }
            // 2. check if the selected pokemon is in the cache, otherwise fetch from the API
            if (selectedPokemon in cache) {
                // read from cache
                setData(cache[selectedPokemon])
                return
            }
            // we passed all the cache stuff to no avail and now need to fetch the data from api
            async function fetchPokemonData() {
                setLoading(true)
                try {
                    const baseUrl = 'https://pokeapi.co/api/v2/'
                    const suffix = 'pokedex/' + getPokedexNumber(selectedPokemon)
                    const finalUrl = baseUrl + suffix
                    const response = await fetch(finalUrl) // Uses fetch() for an HTTP request. await ensures the function pauses until the response is received.
                    // The returned response object contains: 
                    // // Status Code (e.g., 200 for success, 404 for not found). 
                    // Headers (metadata about the response).
                    // Body (JSON data, accessible via .json()).
                    const pokemonData = await response.json() // Converts raw response into JavaScript-readable JSON.
                    // Example JSON for "pikachu":
                    // {
                    //   "name": "pikachu",
                    //   "id": 25,
                    //   "height": 4,
                    //   "weight": 60,
                    //   "types": [
                    //     { "type": { "name": "electric" } }
                    //   ]
                    // }
                    setData(pokemonData)
                    console.log(pokemonData)
                    // Also save the fetched data to cache in the localStorage
                    cache[selectedPokemon] = pokemonData
                    localStorage.setItem('pokedex', JSON.stringify(cache))
                } catch (err) {
                    console.log(err.message)
                } finally {
                    setLoading(false)
                }
            }

            fetchPokemonData()

            // if we fetch from the Api make sure to save the information to the cache for next time
        }, [selectedPokemon]
    )

    return (
        <div></div>
    )
}