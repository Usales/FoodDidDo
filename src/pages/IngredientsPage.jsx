import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PageCommon.css'

const pantryIngredients = [
  { id: 1, name: 'Milho', emoji: '🌽' },
  { id: 2, name: 'Tomate', emoji: '🍅' },
  { id: 3, name: 'Cenoura', emoji: '🥕' },
  { id: 4, name: 'Brócolis', emoji: '🥦' },
  { id: 5, name: 'Batata', emoji: '🥔' },
  { id: 6, name: 'Cebola', emoji: '🧅' },
  { id: 7, name: 'Alho', emoji: '🧄' },
  { id: 8, name: 'Pimentão', emoji: '🫑' },
  { id: 9, name: 'Pepino', emoji: '🥒' },
  { id: 10, name: 'Alface', emoji: '🥬' },
  { id: 11, name: 'Espinafre', emoji: '🍃' },
  { id: 12, name: 'Cogumelo', emoji: '🍄' },
  { id: 13, name: 'Berinjela', emoji: '🍆' },
  { id: 14, name: 'Abobrinha', emoji: '🥒' },
  { id: 15, name: 'Abacate', emoji: '🥑' },
  { id: 16, name: 'Limão', emoji: '🍋' },
  { id: 17, name: 'Laranja', emoji: '🍊' },
  { id: 18, name: 'Maçã', emoji: '🍎' },
  { id: 19, name: 'Banana', emoji: '🍌' },
  { id: 20, name: 'Morango', emoji: '🍓' },
  { id: 21, name: 'Uva', emoji: '🍇' },
  { id: 22, name: 'Melancia', emoji: '🍉' },
  { id: 23, name: 'Abacaxi', emoji: '🍍' },
  { id: 24, name: 'Manga', emoji: '🥭' },
  { id: 25, name: 'Pêssego', emoji: '🍑' },
  { id: 26, name: 'Frango', emoji: '🍗' },
  { id: 27, name: 'Carne Bovina', emoji: '🥩' },
  { id: 28, name: 'Peixe', emoji: '🐟' },
  { id: 29, name: 'Camarão', emoji: '🦐' },
  { id: 30, name: 'Ovo', emoji: '🥚' }
]

export function IngredientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])

  const filteredIngredients = useMemo(() => {
    return pantryIngredients.filter((ingredient) =>
      ingredient.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const handleToggleIngredient = (ingredientId) => {
    setSelected((prev) =>
      prev.includes(ingredientId) ? prev.filter((id) => id !== ingredientId) : [...prev, ingredientId]
    )
  }

  const handleSearchRecipes = () => {
    const names = pantryIngredients
      .filter((ingredient) => selected.includes(ingredient.id))
      .map((ingredient) => ingredient.name)
    navigate('/receitas', { state: { ingredients: names } })
  }

  return (
    <div className="page fridge-page">
      <header className="fridge-header">
        <h1>🛒 Minha Geladeira</h1>
        <p>Selecione os ingredientes disponíveis e descubra o que cozinhar hoje.</p>
      </header>

      <div className="fridge-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Pesquisar ingredientes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <button
          type="button"
          className="primary-btn fridge-search-btn"
          onClick={handleSearchRecipes}
          disabled={selected.length === 0}
        >
          🔍 Pesquisar Receitas ({selected.length})
        </button>
      </div>

      <div className="ingredient-grid">
        {filteredIngredients.map((ingredient) => {
          const isSelected = selected.includes(ingredient.id)
          return (
            <button
              type="button"
              key={ingredient.id}
              className={`ingredient-card${isSelected ? ' selected' : ''}`}
              onClick={() => handleToggleIngredient(ingredient.id)}
            >
              <span className="ingredient-icon">{ingredient.emoji}</span>
              <span>{ingredient.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
