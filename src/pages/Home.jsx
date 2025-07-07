import { Link } from "react-router-dom"

const tools = [
  { name: "Unir PDF", description: "Combina varios archivos PDF", icon: "📎", route: "/unir" },
  // Puedes agregar más herramientas aquí
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-6">
      <h1 className="text-4xl font-bold mb-10 text-center">Herramientas PDF</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            to={tool.route}
            className="bg-gray-800 hover:bg-gray-700 transition-colors duration-300 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center"
          >
            <div className="text-5xl mb-4">{tool.icon}</div>
            <h2 className="text-xl font-semibold mb-2">{tool.name}</h2>
            <p className="text-sm text-gray-400">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
