import React, { useEffect, useState } from 'react';
import ClientNav from '../components/ClientNav.jsx';
import RoomCard from '../components/RoomCard.jsx';
import {
  fetchRooms,
  fetchRoomsByType,
  fetchRoomsByPriceRange,
  fetchRoomsByAvailability
} from '../api/rooms.js';

const PAGE_SIZE = 6; // cantidad de habitaciones por página

export default function Catalog() {
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // Estados independientes para los filtros
  const [selectedType, setSelectedType] = useState('INDIVIDUAL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [activeFilter, setActiveFilter] = useState(null); // { type: 'type' | 'price' | 'dates', label: string }
  const [errorMessage, setErrorMessage] = useState('');

  // Carga paginada normal de habitaciones
  const loadDefaultRooms = async (pageNumber = 0) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await fetchRooms(pageNumber, PAGE_SIZE);
      const content = Array.isArray(data) ? data : (data.content ?? []);
      setRooms(content);
      setPage(typeof data.number === 'number' ? data.number : pageNumber);
      setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 1);
      setTotalElements(typeof data.totalElements === 'number' ? data.totalElements : content.length);
      setActiveFilter(null);
    } catch (err) {
      console.error('Error cargando habitaciones para catálogo:', err);
      setErrorMessage(err.message || 'Error al cargar habitaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeFilter) {
      loadDefaultRooms(page);
    }
  }, [page]);

  // Filtro por Tipo de Habitación
  const handleFilterByType = async (e) => {
    e.preventDefault();
    if (!selectedType) return;

    setLoading(true);
    setErrorMessage('');
    try {
      const data = await fetchRoomsByType(selectedType);
      const list = Array.isArray(data) ? data : [];
      setRooms(list);
      setTotalElements(list.length);
      setTotalPages(1);
      setActiveFilter({
        type: 'type',
        label: `Tipo: ${selectedType === 'INDIVIDUAL' ? 'Individual' : 'Familiar'}`
      });
    } catch (err) {
      console.error('Error al filtrar por tipo:', err);
      setErrorMessage(err.message || 'No se encontraron habitaciones de este tipo.');
      setRooms([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Filtro por Rango de Precios
  const handleFilterByPrice = async (e) => {
    e.preventDefault();
    if (minPrice === '' || maxPrice === '') {
      setErrorMessage('Por favor ingresa tanto el precio mínimo como el máximo.');
      return;
    }

    const min = Number(minPrice);
    const max = Number(maxPrice);

    if (isNaN(min) || isNaN(max) || min < 0 || max < min) {
      setErrorMessage('El rango de precios es inválido. El mínimo debe ser menor o igual al máximo.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const data = await fetchRoomsByPriceRange(min, max);
      const list = Array.isArray(data) ? data : [];
      setRooms(list);
      setTotalElements(list.length);
      setTotalPages(1);
      setActiveFilter({
        type: 'price',
        label: `Precio: $${min} - $${max}`
      });
    } catch (err) {
      console.error('Error al filtrar por rango de precio:', err);
      setErrorMessage(err.message || 'No se encontraron habitaciones en ese rango de precios.');
      setRooms([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Filtro por Disponibilidad de Fechas
  const handleFilterByDates = async (e) => {
    e.preventDefault();
    if (!checkInDate || !checkOutDate) {
      setErrorMessage('Por favor selecciona tanto la fecha de llegada como la de salida.');
      return;
    }

    if (new Date(checkInDate) > new Date(checkOutDate)) {
      setErrorMessage('La fecha de llegada no puede ser posterior a la fecha de salida.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const data = await fetchRoomsByAvailability(checkInDate, checkOutDate);
      const list = Array.isArray(data) ? data : [];
      setRooms(list);
      setTotalElements(list.length);
      setTotalPages(1);
      setActiveFilter({
        type: 'dates',
        label: `Fechas: ${checkInDate} a ${checkOutDate}`
      });
    } catch (err) {
      console.error('Error al filtrar por disponibilidad de fechas:', err);
      setErrorMessage(err.message || 'No se encontraron habitaciones disponibles en ese rango de fechas.');
      setRooms([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar / Restablecer Filtros
  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedType('INDIVIDUAL');
    setCheckInDate('');
    setCheckOutDate('');
    setErrorMessage('');
    setActiveFilter(null);
    setPage(0);
    loadDefaultRooms(0);
  };

  return (
    <div>
      <ClientNav />

      {/* Banner de Bienvenida */}
      <div style={{ padding: '48px 40px 16px', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 650 }}>
          <h6 style={{ color: 'var(--color-accent-300)', margin: 0 }}>Bienvenido a Verdant</h6>
          <h1 style={{ margin: 0 }}>Encuentra tu habitación ideal</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: 15 }}>
            Filtra por tipo, rango de precios o fechas para encontrar el espacio perfecto para tu estadía.
          </p>
        </div>
      </div>

      {/* Contenedor Principal: Filtros a la Izquierda + Catálogo a la Derecha */}
      <div
        style={{
          padding: '24px 40px 64px',
          maxWidth: 1320,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
          alignItems: 'flex-start',
        }}
      >
        {/* Panel Lateral de Filtros (Izquierda) */}
        <aside
          className="card elev-sm"
          style={{
            flex: '0 0 310px',
            width: '100%',
            maxWidth: 320,
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            border: '1px solid var(--color-divider)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Filtros</h3>
            {activeFilter && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleClearFilters}
                style={{ fontSize: 12, padding: '4px 10px' }}
              >
                Limpiar
              </button>
            )}
          </div>

          {/* 1. Filtro por Tipo de Habitación */}
          <form onSubmit={handleFilterByType} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
              Tipo de habitación
            </label>
            <div className="seg" style={{ width: '100%' }}>
              {[
                { label: 'Individual', value: 'INDIVIDUAL' },
                { label: 'Familiar', value: 'FAMILIAR' },
              ].map((t) => (
                <label className="seg-opt" key={t.value} style={{ flex: 1, textAlign: 'center', padding: '8px 12px' }}>
                  <input
                    type="radio"
                    name="filterType"
                    checked={selectedType === t.value}
                    onChange={() => setSelectedType(t.value)}
                  />
                  {t.label}
                </label>
              ))}
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '10px 14px' }}>
              Filtrar por tipo
            </button>
          </form>

          <div style={{ height: 1, background: 'var(--color-divider)', opacity: 0.8 }} />

          {/* 2. Filtro por Rango de Precio */}
          <form onSubmit={handleFilterByPrice} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
              Precio por noche ($)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="field" style={{ flex: 1 }}>
                <input
                  className="input"
                  type="number"
                  placeholder="Mín"
                  min="0"
                  step="0.01"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{ padding: '8px 12px' }}
                />
              </div>
              <span style={{ opacity: 0.5 }}>—</span>
              <div className="field" style={{ flex: 1 }}>
                <input
                  className="input"
                  type="number"
                  placeholder="Máx"
                  min="0"
                  step="0.01"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{ padding: '8px 12px' }}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '10px 14px' }}>
              Filtrar por precio
            </button>
          </form>

          <div style={{ height: 1, background: 'var(--color-divider)', opacity: 0.8 }} />

          {/* 3. Filtro por Disponibilidad de Fechas */}
          <form onSubmit={handleFilterByDates} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
              Disponibilidad de fechas
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field">
                <label style={{ fontSize: 12, marginBottom: 4 }}>Llegada</label>
                <input
                  className="input"
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  required
                  style={{ padding: '8px 12px' }}
                />
              </div>
              <div className="field">
                <label style={{ fontSize: 12, marginBottom: 4 }}>Salida</label>
                <input
                  className="input"
                  type="date"
                  value={checkOutDate}
                  min={checkInDate || undefined}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  required
                  style={{ padding: '8px 12px' }}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '10px 14px' }}>
              Filtrar por fechas
            </button>
          </form>

          {activeFilter && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleClearFilters}
              style={{ width: '100%', padding: '10px 14px', marginTop: 4 }}
            >
              Restablecer todos los filtros
            </button>
          )}
        </aside>

        {/* Sección de Resultados y Habitaciones (Derecha) */}
        <section style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Barra superior de estado / resultados */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: 20 }}>
                {totalElements} habitación{totalElements === 1 ? '' : 'es'} disponible{totalElements === 1 ? '' : 's'}
              </h3>
              {activeFilter && (
                <span className="tag tag-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {activeFilter.label}
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      fontSize: 14,
                      padding: 0,
                      lineHeight: 1,
                    }}
                    title="Quitar filtro"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Mensaje de error si ocurre */}
          {errorMessage && (
            <div
              style={{
                padding: 'var(--space-3)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-accent-700)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-accent-200)',
                fontSize: 13,
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Grid de Habitaciones */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {loading ? (
              <div style={{ gridColumn: '1 / -1', padding: '48px 0', textAlign: 'center', opacity: 0.7 }}>
                Cargando habitaciones...
              </div>
            ) : rooms.length === 0 ? (
              <div
                className="card elev-sm"
                style={{
                  gridColumn: '1 / -1',
                  padding: '48px 24px',
                  textAlign: 'center',
                  border: '1px solid var(--color-divider)',
                  gap: 16,
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 500 }}>No se encontraron habitaciones</div>
                <p style={{ opacity: 0.7, margin: 0, maxWidth: 400 }}>
                  No hay habitaciones que coincidan con el filtro seleccionado. Intenta con otros valores o restablece los filtros.
                </p>
                <button type="button" className="btn btn-secondary" onClick={handleClearFilters}>
                  Mostrar todas las habitaciones
                </button>
              </div>
            ) : (
              rooms.map((room) => (
                <RoomCard key={room.id} room={room} highlighted={false} />
              ))
            )}
          </div>

          {/* Paginación (visible cuando no hay un filtro activo personalizado) */}
          {!activeFilter && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button
                className="btn btn-secondary"
                disabled={page === 0 || loading}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={i === page ? 'btn btn-primary' : 'btn btn-secondary'}
                  disabled={loading}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="btn btn-secondary"
                disabled={page >= totalPages - 1 || loading}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

