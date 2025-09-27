import { useState } from 'react'
import './App.css'
import { 
  AiOutlineHome, 
  AiOutlineUser, 
  AiOutlineFileText, 
  AiOutlineSetting,
  AiOutlineSearch,
  AiOutlineBell,
  AiOutlineMoon,
  AiOutlineReload,
  AiOutlineShoppingCart
} from 'react-icons/ai'
import { 
  IoBookOutline,
  IoHelpCircleOutline 
} from 'react-icons/io5'
import { 
  BiCoffee,
  BiTime,
  BiFire 
} from 'react-icons/bi'
import { 
  MdOutlineRestaurantMenu,
  MdOutlineSalad 
} from 'react-icons/md'
import { 
  GiCupcake,
  GiBread,
  GiChickenOven,
  GiStarFormation 
} from 'react-icons/gi'

function App() {
  const [activeNav, setActiveNav] = useState('home')

  const navItems = [
    { id: 'home', label: 'Home', icon: AiOutlineHome },
    { id: 'profile', label: 'Profile', icon: AiOutlineUser },
    { id: 'orders', label: 'Orders', icon: AiOutlineFileText },
    { id: 'settings', label: 'Settings', icon: AiOutlineSetting },
    { id: 'recipes', label: 'Recipes', icon: IoBookOutline },
    { id: 'grocery', label: 'Grocery', icon: AiOutlineShoppingCart },
    { id: 'help', label: 'Help', icon: IoHelpCircleOutline }
  ]

  const mealItems = [
    { name: 'Bread & Jam, Coffee', icon: BiCoffee },
    { name: 'Grilled Chicken, Salad', icon: MdOutlineSalad },
    { name: 'Fruit tarts, Chocolate mousse', icon: GiCupcake }
  ]

  const recipeCards = [
    {
      id: 1,
      title: 'Red Bread & Jam',
      time: '15 min',
      difficulty: 'Easy',
      image: GiBread,
      theme: 'red'
    },
    {
      id: 2,
      title: 'Grilled Chicken',
      time: '25 min',
      difficulty: 'Medium',
      image: GiChickenOven,
      theme: 'green'
    },
    {
      id: 3,
      title: 'Cashew Nut Salad',
      time: '10 min',
      difficulty: 'Easy',
      image: MdOutlineSalad,
      theme: 'blue'
    }
  ]

  const tasks = [
    {
      id: 1,
      name: 'Avocado toast',
      calories: '250Cal',
      ingredients: 'Avocado, Bread, Eggs',
      time: '15min',
      status: 'in progress'
    },
    {
      id: 2,
      name: 'Alfredo Pasta',
      calories: '450Cal',
      ingredients: 'Alfredo, Chicken, Pasta',
      time: '30min',
      status: 'to do'
    },
    {
      id: 3,
      name: 'Quinoa Salad',
      calories: '200Cal',
      ingredients: 'Carrot, Tomato, Mint',
      time: '10min',
      status: 'completed'
    },
    {
      id: 4,
      name: 'Grilled Chicken',
      calories: '250Cal',
      ingredients: 'Chicken, Spices, Oil',
      time: '30min',
      status: 'to do'
    }
  ]

  const shoppingItems = [
    { id: 1, name: 'Eggs', amount: '2 dozens', checked: true },
    { id: 2, name: 'Chicken breast', amount: '1.5kg', checked: false },
    { id: 3, name: 'Cheese', amount: '200g', checked: true },
    { id: 4, name: 'Milk', amount: '2lt', checked: false },
    { id: 5, name: 'Chocolate', amount: '1 pc', checked: false },
    { id: 6, name: 'Bread', amount: '2pc', checked: false },
    { id: 7, name: 'Potatoes', amount: '2kg', checked: false }
  ]

  return (
    <div className="app">
      <div className="main-layout">
        {/* Sidebar Esquerda */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="logo">Eggify</div>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <a
                key={item.id}
                href="#"
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveNav(item.id)
                }}
              >
                <span className="nav-icon"><item.icon /></span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Área de Conteúdo */}
        <div className="content-area">
          {/* Header */}
          <header className="header">
            <div className="search-container">
              <span className="search-icon"><AiOutlineSearch /></span>
              <input
                type="text"
                placeholder="Search anything"
                className="search-input"
              />
            </div>
            <div className="header-actions">
              <button className="header-btn"><AiOutlineBell /></button>
              <button className="header-btn"><AiOutlineMoon /></button>
              <button className="header-btn"><AiOutlineReload /></button>
              <button className="header-btn profile-btn"><AiOutlineUser /></button>
            </div>
          </header>

          {/* Conteúdo Principal */}
          <main className="main-content">
            {/* Hero Banner */}
            <section className="hero-banner">
              <div className="hero-content">
                <h1 className="hero-title">
                  Elevate Your Culinary Experience with Eggify
                </h1>
                <p className="hero-subtitle">
                  Explore recipes, plan your week, and shop seamlessly. Elevate your dining experience effortlessly. 
                  From curated recipes to nutrition insights, we've cracked the code for a tasteful journey in every bite.
                </p>
                <button className="hero-btn">Get started</button>
              </div>
              <div className="hero-illustrations">
                🍔🥪🍳
              </div>
            </section>

            {/* Grid de Conteúdo */}
            <div className="content-grid">
              {/* Your Meal Today */}
              <section className="meal-today">
                <div className="meal-header">
                  <div className="date-circle">16</div>
                  <h2 className="meal-title">Your Meal Today</h2>
                </div>
                <ul className="meal-list">
                  {mealItems.map((meal, index) => (
                    <li key={index} className="meal-item">
                      <div className="meal-icon"><meal.icon /></div>
                      <span>{meal.name}</span>
                    </li>
                  ))}
                </ul>
                <div className="meal-stats">
                  <span><BiFire /> 2k</span>
                  <span><BiTime /> 1hr</span>
                </div>
                <button className="btn-secondary">Details</button>
              </section>

              {/* Espaço para outros componentes */}
              <div></div>
            </div>

            {/* Recipe Cards */}
            <section className="recipe-cards">
              {recipeCards.map(recipe => (
                <div key={recipe.id} className={`recipe-card card ${recipe.theme}`}>
                  <div className="recipe-image" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: '12px',
                    margin: '1rem',
                    height: '150px'
                  }}>
                    <recipe.image />
                  </div>
                  <div className="recipe-content">
                    <h3 className="recipe-title">{recipe.title}</h3>
                    <div className="recipe-meta">
                      <span><BiTime /> {recipe.time}</span>
                      <span><MdOutlineRestaurantMenu /> {recipe.difficulty}</span>
                    </div>
                    <button className="recipe-btn">See recipe</button>
                  </div>
                </div>
              ))}
            </section>

            {/* Upcoming Tasks */}
            <section className="upcoming-tasks card">
              <div className="section-header">
                <h2 className="section-title">Upcoming task</h2>
                <a href="#" className="view-all">All tasks →</a>
              </div>
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Item name</th>
                    <th>Calories</th>
                    <th>Ingredients</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          className="task-checkbox"
                          checked={task.status === 'completed'}
                          readOnly
                        />
                      </td>
                      <td>{task.name}</td>
                      <td>{task.calories}</td>
                      <td>{task.ingredients}</td>
                      <td>{task.time}</td>
                      <td>
                        <span className={`status-badge ${
                          task.status === 'completed' ? 'status-completed' :
                          task.status === 'in progress' ? 'status-progress' :
                          'status-todo'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </main>
        </div>

        {/* Right Sidebar */}
        <div className="right-sidebar">
          {/* Shopping List */}
          <section className="shopping-list">
            <div className="shopping-header">
              <h3><AiOutlineShoppingCart /> Shopping list</h3>
              <a href="#" className="view-all">See all →</a>
            </div>
            {shoppingItems.map(item => (
              <div key={item.id} className="shopping-item">
                <input 
                  type="checkbox" 
                  className="shopping-checkbox"
                  checked={item.checked}
                  readOnly
                />
                <div className="shopping-details">
                  <div className="shopping-name">{item.name}</div>
                  <div className="shopping-amount">{item.amount}</div>
                </div>
              </div>
            ))}
            <button className="shop-now-btn">Shop now</button>
          </section>

          {/* Offers */}
          <section className="offers-section">
            <h3>Offers for you</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
              Personalized deals for you! Discover exclusive discounts and culinary delights.
            </p>
            <div className="offer-card">
              <div className="offer-title">FRESH & HEALTHY</div>
              <div className="offer-title">FOOD MENU</div>
              <div className="offer-price">$74</div>
              <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                <GiStarFormation /> Valid until 30th
              </div>
              <button className="offer-btn">Get now</button>
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}

export default App
