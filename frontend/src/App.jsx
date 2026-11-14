import { useEffect, useState } from 'react'
import api from './api'

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const loadTasks = async () => {
    try {
      const response = await api.get('/tasks')
      setTasks(response.data)
      setError('')
    } catch {
      setError("Impossible de charger les tâches. Vérifie le serveur Symfony.")
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const addTask = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await api.post('/tasks', { title, description })
      setTitle('')
      setDescription('')
      loadTasks()
    } catch {
      setError("Impossible d'ajouter la tâche.")
    }
  }

  const toggleTask = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, {
        isCompleted: !task.isCompleted,
      })
      loadTasks()
    } catch {
      setError('Impossible de modifier la tâche.')
    }
  }

  const startEditing = (task) => {
  setEditingId(task.id)
  setEditTitle(task.title)
  setEditDescription(task.description || '')
}

const updateTask = async (e) => {
  e.preventDefault()

  if (!editTitle.trim()) return

  try {
    await api.put(`/tasks/${editingId}`, {
      title: editTitle,
      description: editDescription,
    })

    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
    loadTasks()
  } catch {
    setError('Impossible de modifier la tâche.')
  }
}

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`)
      loadTasks()
    } catch {
      setError('Impossible de supprimer la tâche.')
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.isCompleted
    if (filter === 'completed') return task.isCompleted
    return true
  })

  const completed = tasks.filter((task) => task.isCompleted).length
  const active = tasks.length - completed

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
            TaskFlow
          </p>
          <h1 className="mt-3 text-4xl font-bold">Organise tes journées.</h1>
          <p className="mt-2 text-slate-400">
            Toutes tes tâches au même endroit.
          </p>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ['Total', tasks.length],
            ['En cours', active],
            ['Terminées', completed],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <form onSubmit={addTask} className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Nouvelle tâche</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la tâche"
            className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 outline-none focus:border-blue-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (facultative)"
            rows="3"
            className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 outline-none focus:border-blue-500"
          />
          <button className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500">
            + Ajouter la tâche
          </button>
        </form>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Mes tâches</h2>
            <div className="flex gap-2">
              {[
                ['all', 'Toutes'],
                ['active', 'En cours'],
                ['completed', 'Terminées'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    filter === value
                      ? 'bg-blue-600'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="mb-4 rounded-xl bg-red-950 p-3 text-red-300">{error}</p>}

          <div className="space-y-3">
            
{filteredTasks.map((task) => (
  <article
    key={task.id}
    className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
  >
    {editingId === task.id ? (
      <form onSubmit={updateTask} className="space-y-3">
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Titre"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
        />

        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Description"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2"
          >
            Enregistrer
          </button>

          <button
            type="button"
            onClick={() => setEditingId(null)}
            className="rounded-lg bg-slate-700 px-4 py-2"
          >
            Annuler
          </button>
        </div>
      </form>
    ) : (
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className={`font-semibold ${task.isCompleted ? 'text-slate-500 line-through' : ''}`}>
            {task.title}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {task.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => startEditing(task)}
            className="rounded-lg bg-blue-700 px-3 py-2 text-sm"
          >
            Modifier
          </button>

          <button
            onClick={() => toggleTask(task)}
            className="rounded-lg bg-emerald-700 px-3 py-2 text-sm"
          >
            {task.isCompleted ? 'Réactiver' : 'Terminer'}
          </button>

          <button
            onClick={() => deleteTask(task.id)}
            className="rounded-lg bg-red-900 px-3 py-2 text-sm"
          >
            Supprimer
          </button>
        </div>
      </div>
    )}
  </article>
))}


            {filteredTasks.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
                Aucune tâche à afficher.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
