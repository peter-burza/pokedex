import { useState, useEffect } from 'react'
import { getPokedexNumber, getFullPokedexNumber } from '../utils'
import TypeCard from './TypeCard'
import Modal from './Modal'

export default function PokeCard(props) {
    const { selectedPokemon } = props
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [skill, setSkill] = useState(null)
    const [loadingSkill, setLoadingSkill] = useState(false)

    const { name, height, abilities, stats, types, moves, sprites } = data || {} /* This line uses object destructuring in JavaScript to extract specific properties from the data object. It is a concise way to safely access multiple properties from an object
    without having to repeatedly reference the object itself.
    { name, height, abilities, stats, types, moves, sprites }: This extracts these properties from data and creates variables with the same names.
    If a property does not exist in data, its variable will be undefined. */

    const imgList = Object.keys(sprites || {}).filter(val => { // Keep only wanted data (4 small images)
        if (!sprites[val]) return false // If the value is falsy (null, undefined, etc.), exclude it.
        if (['versions', 'other'].includes(val)) return false // If the value is from object name (folder) 'versions' or 'other', exclude it.
        return true
    })

    async function fetchMoveData(move, moveUrl) {
        if (loadingSkill || !localStorage || !moveUrl) return // safe guard - If the person is unpatient and clicks on the move button while already loading skill.

        // check cache for move
        let c = {}
        if (localStorage.getItem('pokemon-moves')) { // if cache exists, read it
            c = JSON.parse(localStorage.getItem('pokemon-moves')) // Reads the cached moves from localStorage and parses it into a JavaScript object.
        }
        
        if (move in c) { // if move is in cache, use it
            setSkill(c[move]) 
            console.log('Found move in cache:', move)
            return
        }
        
        // otherwise fetch from API
        try {
            setLoadingSkill(true)
            const response = await fetch(moveUrl) // Fetches the move data from the API using the provided URL.
            const moveData = await response.json() // Converts the response to JSON format.
            console.log('Fetched move from API', move, moveData)
            const description = moveData?.flavor_text_entries.filter 
            (val => {
                return val.version_group.name = 'firered-leafgreen'
            })[0]?.flavor_text // Filters the move data to find the description in the 'firered-leafgreen' version group and retrieves the first entry's flavor text.

            const skillData = {
                name: move,
                description 
            }
            setSkill(skillData) // Sets the skill state with the fetched move data, which will be used to display in the modal.
            c[move] = skillData // Adds the fetched move data to the cache object.
            localStorage.setItem('pokemon-moves', JSON.stringify(c)) // Saves the move data to localStorage for future use.
        } catch (err) {
            console.log(err.message)
        } finally {
            setLoadingSkill(false)
        }
    }
    // useEffect is a way to set 'event listener function' that takes 2 inputs. 1. = callback func to be executed, whenever the event that we're listening for is triggered. 
    // 2. = dependency array, when its empty, callback func is called right after the page is fully loaded, or when the dependency array will change its 
    // value -> {() => {callBack function}, []}
    useEffect(
        () => {
            if (loading || !localStorage) return // gard close - if loading => exit logic
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
                console.log('Found pokemon in cache:', selectedPokemon)
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
                    console.log('Fetched pokemon data from API:', pokemonData)
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
            {skill && (
                <Modal handleCloseModal={() => { setSkill(null) }}> {/* Do Modal only if skill is true */}
                    <div>
                        <h6>Name</h6>
                        <h2 className="skill-name">{skill.name.replaceAll('-', ' ')}</h2>
                    </div>
                    <div>
                        <h6>Description</h6>
                        <p>{skill.description}</p>
                    </div>
                </Modal>
            )}
            <div>
                <h4>#{getFullPokedexNumber(selectedPokemon)}</h4>
                <h2>{name}</h2>
            </div>
            <div className='type-container'>
                {types.map((typeObj, typeIndex) => {
                    return (
                        <TypeCard key={typeIndex} type={typeObj?.type?.name} /> // '?.' - is chaining operator, it checks if typeObj and typeObj.type are defined before accessing typeObj.type.name. If either is undefined or null, it returns undefined instead of throwing an error.
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
                        <button key={moveIndex} className='button-card pokemon-move' onClick={() => {
                            fetchMoveData(moveObj.move.name, moveObj.move.url) // Calls the function to fetch move data when the button is clicked.
                        }}>
                            <p>{moveObj?.move?.name.replaceAll('-', ' ')}</p>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}