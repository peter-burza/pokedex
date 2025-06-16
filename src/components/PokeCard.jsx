import { useState, useEffect } from 'react'
import { getPokedexNumber, getFullPokedexNumber } from '../utils'
import TypeCard from './TypeCard'

export default function PokeCard(props) {
    const { selectedPokemon } = props
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)

    const { name, height, abilities, stats, types, moves, sprites } = data || {} /* This line uses object destructuring in JavaScript to extract specific properties from the data object. It is a concise way to safely access multiple properties from an object
    without having to repeatedly reference the object itself.
    { name, height, abilities, stats, types, moves, sprites }: This extracts these properties from data and creates variables with the same names.
    If a property does not exist in data, its variable will be undefined. */

    const imgList = Object.keys(sprites || {}).filter(val => { // Filters only wanted data (4 small images)
        if (!sprites[val]) return false // If the value is falsy (null, undefined, etc.), exclude it.
        if (['versions', 'other'].includes(val)) return false // If the value is from object name (folder) 'versions' or 'other', exclude it.
        return true
    })

    // useEffect is a way to set 'event listener function' that takes 2 inputs. 1. = callback func to be executed, whenever the event that we're listening for is triggered. 
    // 2. = dependency array, when its empty, callback func is called right after the page is fully loaded, or when the dependency array will change its 
    // value -> {() => {callBack function}, []}
    useEffect(
        () => {

            // if loading => exit logic
            if (loading || !localStorage) return // gard close
            // check if the selected pokemon is available in the cache
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
                    const suffix = 'pokemon/' + getPokedexNumber(selectedPokemon)
                    const finalUrl = baseUrl + suffix
                    const response = await fetch(finalUrl) // Uses fetch() for an HTTP request. await ensures the function pauses until the response is received.
                    // The returned response object contains: 
                    // Status Code (e.g., 200 for success, 404 for not found). 
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
        }, [selectedPokemon])

    if (loading || !data) {
        return (
            <div>
                <h4>Loading...</h4>
            </div>
        )
    }

    return (
        <div className='poke-card'>
            <div>
                <h4>#{getFullPokedexNumber(selectedPokemon)}</h4>
                <h2>{name}</h2>
            </div>
            <div className='type-container'>
                {types.map((typeObj, typeIndex) => {
                    return (
                        <TypeCard key={typeIndex} type={typeObj?.type?.name} /> // ?. is chaining operator, it checks if typeObj and typeObj.type are defined before accessing typeObj.type.name. If either is undefined or null, it returns undefined instead of throwing an error.
                    )
                })}
            </div>
            <img className='default-img' src={'/pokemon/' + getFullPokedexNumber(selectedPokemon) + '.png'} alt={`${name}-large-img`} />
            <div className='img-container'>
                {imgList.map((spriteUrl, spriteIndex) => { // Outputs an images from imgList from Sprites object. Check in localStorage on the browser to see the structure of the object.
                    const imgUrl = sprites[spriteUrl]
                    /* This is how the umgList after filtering looks like for 1st pokemon (bulbasaur):
                    imgList:
                        back_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png"
                        back_shiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/1.png"
                        front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
                        front_shiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png"
                    */
                    return (
                        <img key={spriteIndex} src={imgUrl} alt={`${name}-img-${spriteUrl}`} />
                    )
                })}
            </div>
            <h3>Stats</h3>
            <div className='stats-card'>
                {stats.map((statObj, statIndex) => {
                    const { stat, base_stat } = statObj

                    return (
                        <div key={statIndex} className='stat-item'>
                            <p>{stat?.name.replaceAll('-', ' ')}</p>
                            <h4>{base_stat}</h4>
                        </div>
                    )
                })}
            </div>
            <h3>Moves</h3>
            <div className='pokemon-move-grid'>
                {moves.map((moveObj, moveIndex) => {
                    return (
                        <button key={moveIndex} className='button-card pokemon-move' onClick={() => {}}>
                            <p>{moveObj?.move?.name.replaceAll('-', ' ')}</p>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}