import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass, HiOutlineMapPin, HiOutlineStar, HiOutlineArrowRight, HiOutlineBuildingOffice2, HiOutlineCalendarDays, HiOutlineShieldCheck } from 'react-icons/hi2';
import { propertiesAPI } from '../../services/api';

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertiesAPI.getAll()
      .then(res => setProperties(res.data.properties))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ═══════ Hero Section ═══════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface-900 via-surface-800 to-primary-900 text-white">
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
        {/* Glowing orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-primary-200 mb-6">
              <HiOutlineStar className="w-4 h-4" />
              <span>Boutique Hotels across Italy</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              Discover{' '}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Extraordinary
              </span>
              <br />
              Stays
            </h1>
            <p className="text-lg md:text-xl text-surface-300 mb-10 max-w-xl leading-relaxed">
              From Venice's canals to Lake Garda's shores — experience curated hospitality at HHBB Hotels.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
                />
              </div>
              <Link
                to="/search"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-sm shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:translate-y-[-2px] transition-all"
              >
                Search
                <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ Features ═══════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: HiOutlineBuildingOffice2, title: 'Multiple Locations', desc: 'Three stunning properties across Northern Italy' },
              { icon: HiOutlineCalendarDays, title: 'Easy Booking', desc: 'Search, compare, and book your perfect room in seconds' },
              { icon: HiOutlineShieldCheck, title: 'Referral Rewards', desc: 'Earn points by referring friends and family' }
            ].map((feat, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-surface-100 hover:border-primary-200 hover:shadow-card transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors">
                  <feat.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-lg text-surface-900 mb-2">{feat.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ Properties ═══════ */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-surface-900 mb-4">Our Properties</h2>
            <p className="text-surface-500 text-lg max-w-lg mx-auto">Each location offers a unique Italian experience</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 rounded-2xl bg-surface-200 animate-pulse" />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {properties.map((property, i) => (
                <Link key={property.id} to={`/search?property_id=${property.id}`}
                  className="group relative rounded-2xl overflow-hidden bg-white shadow-soft hover:shadow-elevated transition-all duration-500 hover:translate-y-[-4px]"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Image placeholder */}
                  <div className="h-48 bg-gradient-to-br from-primary-400 to-accent-400 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                        {property.rooms?.length || 0} rooms
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-bold text-lg text-surface-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {property.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-surface-500 text-sm mb-3">
                      <HiOutlineMapPin className="w-4 h-4" />
                      <span>{property.city}, {property.country}</span>
                    </div>
                    <p className="text-surface-500 text-sm line-clamp-2">{property.description}</p>
                    {property.rooms?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-surface-100 flex items-center justify-between">
                        <span className="text-sm text-surface-500">From</span>
                        <span className="font-display font-bold text-lg text-primary-600">
                          €{Math.min(...property.rooms.map(r => parseFloat(r.price_per_night)))}
                          <span className="text-xs text-surface-400 font-normal">/night</span>
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-surface-500">
              <HiOutlineBuildingOffice2 className="w-12 h-12 mx-auto mb-4 text-surface-300" />
              <p>No properties available yet. Start the backend server to load data.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
