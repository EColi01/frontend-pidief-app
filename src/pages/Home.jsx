import { Link } from 'react-router-dom';

export default function Home() {
  const tools = [
    { name: 'Unir PDFs', path: '/unir-pdf' },
    { name: 'Dividir PDF', path: '/dividir-pdf' },
    { name: 'Comprimir PDF', path: '/comprimir-pdf' },
    { name: 'Convertir a Word', path: '/pdf-a-word' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Herramientas de PDF</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            to={tool.path}
            className="bg-gray-800 hover:bg-gray-700 transition-all rounded-xl shadow p-6 text-center text-white text-lg font-semibold"
          >
            {tool.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
