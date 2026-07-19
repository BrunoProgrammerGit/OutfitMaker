import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../../lib/api'
import BrowserWindow from '../../components/BrowserWindow'
import StatueBust from '../../components/StatueBust'
import './RegisterForm.css'

function validate(fields) {
  const errors = {}
  if (!fields.email.trim()) errors.email = 'El correo es obligatorio.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = 'Ingresa un correo válido.'
  if (!fields.password) errors.password = 'La contraseña es obligatoria.'
  else if (fields.password.length < 8)
    errors.password = 'Mínimo 8 caracteres.'
  if (!fields.confirmPassword)
    errors.confirmPassword = 'Confirma tu contraseña.'
  else if (fields.password !== fields.confirmPassword)
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  return errors
}

export default function RegisterForm() {
  const navigate = useNavigate()
  const [fields, setFields] = useState({ email: '', password: '', confirmPassword: '' })
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const errors = validate(fields)
  const visibleErrors = submitted
    ? errors
    : Object.fromEntries(Object.entries(errors).filter(([k]) => touched[k]))

  const mutation = useMutation({
    mutationFn: (data) => api.post('/auth/register', data),
    onSuccess: () => navigate('/'),
    onError: (err) => {
      const msg = err?.response?.data?.message
      if (msg === 'EMAIL_ALREADY_REGISTERED') return
    },
  })

  function handleChange(e) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length > 0) return
    mutation.mutate({ email: fields.email, password: fields.password })
  }

  const serverEmailTaken =
    mutation.isError &&
    mutation.error?.response?.data?.message === 'EMAIL_ALREADY_REGISTERED'

  return (
    <div className="register-page">
      <div className="register-statue" aria-hidden="true">
        <StatueBust />
      </div>
      <BrowserWindow title="outfitmaker — registro" className="register-window" overflow>
        <span className="section-label">Nueva cuenta</span>
        <h1 className="register-title script">Crear cuenta</h1>
        <p className="register-sub">Empieza a organizar tu armario.</p>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <Field
            label="Correo electrónico"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={serverEmailTaken ? 'Este correo ya está registrado.' : visibleErrors.email}
          />
          <Field
            label="Contraseña"
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={fields.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={visibleErrors.password}
          />
          <Field
            label="Confirmar contraseña"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={fields.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={visibleErrors.confirmPassword}
          />

          {mutation.isError && !serverEmailTaken && (
            <p className="register-error-global" role="alert">
              Ocurrió un error. Inténtalo de nuevo.
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary register-submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Registrando…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="register-login-link">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">Iniciar sesión</Link>
        </p>
      </BrowserWindow>
    </div>
  )
}

function Field({ label, id, name, type, autoComplete, value, onChange, onBlur, error }) {
  return (
    <div className={`register-field${error ? ' register-field--error' : ''}`}>
      <label htmlFor={id} className="register-label">{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="register-input"
      />
      {error && (
        <span id={`${id}-error`} className="register-field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
