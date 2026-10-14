import React, { useEffect, useState } from 'react';
import ClientNav from '../components/ClientNav.jsx';
import RoomCard from '../components/RoomCard.jsx';
import {
  fetchRooms,
  fetchRoomsByType,
  fetchRoomsByPriceRange,
  fetchRoomsByAvailability
} from '../api/rooms.js';
import styles from './Catalog.module.css';

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
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <h6 className={styles.eyebrow}>Bienvenido a Verdant</h6>
          <h1 className={styles.title}>Encuentra tu habitación ideal</h1>
          <p className={styles.subtitle}>
            Filtra por tipo, rango de precios o fechas para encontrar el espacio perfecto para tu estadía.
          </p>
        </div>
      </div>

      {/* Contenedor Principal: Filtros a la Izquierda + Catálogo a la Derecha */}
      <div className={styles.layout}>
        {/* Panel Lateral de Filtros (Izquierda) */}
        <aside className={`card ${styles.sidebar}`}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>Filtros</h3>
            {activeFilter && (
              <button
                type="button"
                className={`btn btn-ghost ${styles.clearLink}`}
                onClick={handleClearFilters}
              >
                Limpiar
              </button>
            )}
          </div>

          {/* 1. Filtro por Tipo de Habitación */}
          <form onSubmit={handleFilterByType} className={styles.filterForm}>
            <label className={styles.filterLabel}>
              Tipo de habitación
            </label>
            <div className={`seg ${styles.segmented}`}>
              {[
                { label: 'Individual', value: 'INDIVIDUAL' },
                { label: 'Familiar', value: 'FAMILIAR' },
              ].map((t) => (
                <label className={`seg-opt ${styles.segOption}`} key={t.value}>
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
            <button type="submit" className={`btn btn-secondary ${styles.fullButton}`}>
              Filtrar por tipo
            </button>
          </form>

          <div className={styles.divider} />

          {/* 2. Filtro por Rango de Precio */}
          <form onSubmit={handleFilterByPrice} className={styles.filterForm}>
            <label className={styles.filterLabel}>
              Precio por noche ($)
            </label>
            <div className={styles.priceRow}>
              <div className={`field ${styles.priceField}`}>
                <input
                  className="input"
                  type="number"
                  placeholder="Mín"
                  min="0"
                  step="0.01"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <span className={styles.rangeDash}>—</span>
              <div className={`field ${styles.priceField}`}>
                <input
                  className="input"
                  type="number"
                  placeholder="Máx"
                  min="0"
                  step="0.01"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className={`btn btn-secondary ${styles.fullButton}`}>
              Filtrar por precio
            </button>
          </form>

          <div className={styles.divider} />

          {/* 3. Filtro por Disponibilidad de Fechas */}
          <form onSubmit={handleFilterByDates} className={styles.filterForm}>
            <label className={styles.filterLabel}>
              Disponibilidad de fechas
            </label>
            <div className={styles.dateFields}>
              <div className="field">
                <label className={styles.dateLabel}>Llegada</label>
                <input
                  className="input"
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label className={styles.dateLabel}>Salida</label>
                <input
                  className="input"
                  type="date"
                  value={checkOutDate}
                  min={checkInDate || undefined}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className={`btn btn-secondary ${styles.fullButton}`}>
              Filtrar por fechas
            </button>
          </form>

          {activeFilter && (
            <button
              type="button"
              className={`btn btn-primary ${styles.resetButton}`}
              onClick={handleClearFilters}
            >
              Restablecer todos los filtros
            </button>
          )}
        </aside>

        {/* Sección de Resultados y Habitaciones (Derecha) */}
        <section className={styles.results}>
          {/* Barra superior de estado / resultados */}
          <div className={styles.resultsBar}>
            <div className={styles.resultsSummary}>
              <h3 className={styles.resultsCount}>
                {totalElements} habitación{totalElements === 1 ? '' : 'es'} disponible{totalElements === 1 ? '' : 's'}
              </h3>
              {activeFilter && (
                <span className={`tag tag-accent ${styles.filterChip}`}>
                  {activeFilter.label}
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className={styles.chipClose}
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
            <div className={styles.errorBox}>
              {errorMessage}
            </div>
          )}

          {/* Grid de Habitaciones */}
          <div className={styles.grid}>
            {loading ? (
              <div className={styles.loading}>
                Cargando habitaciones...
              </div>
            ) : rooms.length === 0 ? (
              <div className={`card ${styles.empty}`}>
                <div className={styles.emptyTitle}>No se encontraron habitaciones</div>
                <p className={styles.emptyText}>
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
            <div className={styles.pagination}>
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
