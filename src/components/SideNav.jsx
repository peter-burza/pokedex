import { first151Pokemon, getFullPokedexNumber } from "../utils"
import { useState } from 'react'

export default function SideNav(props) {
    const { selectedPokemon, setSelectedPokemon, handleCloseMenu, showSideMenu } = props
    const [searchValue, setSearchValue] = useState('')
    const filteredPokemon = first151Pokemon.filter((ele, eleIndex) => {
        // If full pokemon name includes the current search value, return true
        if (getFullPokedexNumber(eleIndex).includes(searchValue)) return true

        // If the pokemon name includes the current search name, return true
        if(ele.toLowerCase().includes(searchValue.toLowerCase())) return true

        // Otherwise, exclude value from the array
        return false
    })

    return (
        <nav className={' ' + (showSideMenu ? " open" : '')}>
            <div className={"header " + (!showSideMenu ? " open" : '')}>
                <button onClick={handleCloseMenu} className="open-nav-button">
                    <i className="fa-solid fa-arrow-left-long"></i>
                </button>
                <h1 className="text-gradient">Pokedéx</h1>
            </div>
            <input placeholder="E.g. 001 or Bulba..." value={searchValue}  onChange={(e) => {
                setSearchValue(e.target.value)
            }}/>
            {filteredPokemon.map((pokemon) => {
                const truePokedexNumber = first151Pokemon.indexOf(pokemon)
                return (
                    <button onClick={() => {
                        setSelectedPokemon(truePokedexNumber)
                        handleCloseMenu()
                    }} key={truePokedexNumber} className={'nav-card ' + (truePokedexNumber === selectedPokemon ? 'nav-card-selected' : '')}>
                        <p>{getFullPokedexNumber(truePokedexNumber)}</p>
                        <p>{pokemon}</p>
                    </button>
                )
            })}
        </nav>
    )
}
