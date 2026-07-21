import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import api from '../../lib/api'
import { validateGarmentImage } from './imageValidation'
import './ClosetPage.css'

const defaultForm = {
  name: '',
  category: '',
  description: '',
  image: null,
}

async function fetchGarments() {
  const { data } = await api.get('/garments')
  return data
}

async function createGarment(formData) {
  const payload = new FormData()
  payload.append('name', formData.name)
  payload.append('category', formData.category)
  payload.append('description', formData.description)
  if (formData.image) payload.append('image', formData.image)
  const { data } = await api.post('/garments', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

async function updateGarment(id, formData) {
  const payload = new FormData()
  payload.append('name', formData.name)
  payload.append('category', formData.category)
  payload.append('description', formData.description)
  if (formData.image) payload.append('image', formData.image)
  const { data } = await api.patch(`/garments/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

async function deleteGarment(id) {
  const { data } = await api.delete(`/garments/${id}`)
  return data
}

export default function ClosetPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(defaultForm)
  const [editingId, setEditingId] = useState(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  const { data: garments = [], isLoading } = useQuery({
    queryKey: ['garments'],
    queryFn: fetchGarments,
  })

  const parentRef = useRef(null)
  const count = garments.length
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 240,
    overscan: 4,
  })

  const createMutation = useMutation({
    mutationFn: createGarment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garments'] })
      setForm(defaultForm)
      setPreviewUrl('')
      setStatus('Prenda añadida al clóset.')
      setError('')
    },
    onError: (err) => {
      setError(err?.response?.data?.message || 'No se pudo guardar la prenda.')
      setStatus('')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => updateGarment(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garments'] })
      setEditingId(null)
      setForm(defaultForm)
      setPreviewUrl('')
      setStatus('Prenda actualizada.')
      setError('')
    },
    onError: (err) => {
      setError(err?.response?.data?.message || 'No se pudo actualizar la prenda.')
      setStatus('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteGarment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garments'] })
      setStatus('Prenda eliminada.')
      setError('')
    },
    onError: (err) => {
      setError(err?.response?.data?.message || 'No se pudo borrar la prenda.')
      setStatus('')
    },
  })

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const validation = await validateGarmentImage(file)
    if (!validation.valid) {
      setError(validation.error)
      setStatus('Intenta con otra foto.')
      event.target.value = ''
      return
    }
    setError('')
    setStatus('Imagen válida. Puedes guardar la prenda.')
    setForm((prev) => ({ ...prev, image: file }))
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, formData: form })
      return
    }
    createMutation.mutate(form)
  }

  const handleEdit = (garment) => {
    setEditingId(garment.id)
    setForm({
      name: garment.name,
      category: garment.category || '',
      description: garment.description || '',
      image: null,
    })
    setPreviewUrl(garment.imageUrl || '')
    setStatus('Editando prenda.')
    setError('')
  }

  const handleDelete = (id) => {
    deleteMutation.mutate(id)
  }

  const isBusy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <div className="closet-page">
      <section className="closet-toolbar">
        <div>
          <p className="section-label">Mi clóset</p>
          <h1 className="script closet-title">Tu colección personal</h1>
          <p className="closet-subtitle">Sube fotos de tus prendas y mantén el armario siempre ordenado.</p>
        </div>
        <form className="closet-form" onSubmit={handleSubmit}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre" required />
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Categoría" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción" />
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
          <button type="submit" disabled={isBusy}>{editingId ? 'Guardar cambios' : 'Agregar prenda'}</button>
          {previewUrl ? <img src={previewUrl} alt="Vista previa" className="preview-image" /> : null}
        </form>
      </section>

      {status ? <p className="closet-status">{status}</p> : null}
      {error ? <p className="closet-error">{error}</p> : null}

      <section className="closet-grid-section">
        <div ref={parentRef} className="closet-grid-scroll" style={{ height: 520 }}>
          {isLoading ? (
            <p>Cargando prendas…</p>
          ) : (
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const garment = garments[virtualItem.index]
                return (
                  <div
                    key={garment.id}
                    className="closet-card"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      transform: `translateY(${virtualItem.start}px)`,
                      width: '100%',
                    }}
                  >
                    <img src={garment.imageUrl || 'https://placehold.co/600x600/png?text=OutfitMaker'} alt={garment.name} />
                    <div className="closet-card-content">
                      <h3>{garment.name}</h3>
                      <p>{garment.category || 'Sin categoría'}</p>
                      <p>{garment.description || 'Sin descripción'}</p>
                      <div className="closet-card-actions">
                        <button type="button" onClick={() => handleEdit(garment)}>Editar</button>
                        <button type="button" onClick={() => handleDelete(garment.id)}>Borrar</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
