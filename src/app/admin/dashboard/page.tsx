'use client'

import { Eye, FileText, Users, TrendingUp, PlusCircle, Edit, Trash2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const STATS = [
  { label: 'Ukupno vesti', value: '16', change: '+3 ove nedelje', icon: FileText, color: 'bg-blue-500' },
  { label: 'Pregledi danas', value: '8,420', change: '+12% vs juče', icon: Eye, color: 'bg-green-500' },
  { label: 'Korisnici', value: '5', change: '3 aktivna', icon: Users, color: 'bg-purple-500' },
  { label: 'Trending vesti', value: '6', change: 'Ažurirano pre 1h', icon: TrendingUp, color: 'bg-orange-500' },
]

const RECENT_ARTICLES = [
  { title: 'Predsednik Vučić najavio rekordna ulaganja u infrastrukturu Zrenjanina', category: 'Politika', views: 15420, status: 'objavljeno', date: 'pre 2h' },
  { title: 'Continental širi pogone u Zrenjaninu — 500 novih radnih mesta', category: 'Ekonomija', views: 12100, status: 'objavljeno', date: 'pre 6h' },
  { title: 'FK Proleter slavi: Pobeda u derbiju donosi vrh tabele Superlige', category: 'Sport', views: 9870, status: 'objavljeno', date: 'pre 8h' },
  { title: 'MUP u velikoj akciji: Zaplenjena droga i oružje u Zrenjaninu', category: 'Hronika', views: 18900, status: 'objavljeno', date: 'pre 18h' },
  { title: 'Novi most na Begeju gotov do kraja godine', category: 'Zrenjanin', views: 8930, status: 'objavljeno', date: 'pre 4h' },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline font-black text-2xl text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Pregled portala Banatski Glas</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Nova vest
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="font-headline font-black text-2xl text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-green-600 mt-1">{stat.change}</p>
            </div>
          )
        })}
      </div>

      {/* Breaking news alert */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-brand-red flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm text-red-800 dark:text-red-200">2 aktivne BREAKING vesti</p>
          <p className="text-xs text-red-600 dark:text-red-400">Predsednik Vučić u Zrenjaninu • MUP akcija Banat</p>
        </div>
        <Link href="/admin/articles" className="ml-auto text-xs text-brand-red font-semibold hover:underline">
          Upravljaj →
        </Link>
      </div>

      {/* Recent articles */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-bold text-sm uppercase tracking-wide text-gray-500">Nedavne vesti</h2>
          <Link href="/admin/articles" className="text-xs text-brand-red font-semibold hover:underline">
            Sve vesti
          </Link>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {RECENT_ARTICLES.map((article, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{article.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">{article.category}</span>
                  <span className="text-xs text-gray-400">{article.date}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Eye className="w-3 h-3" />{article.views.toLocaleString('sr-RS')}
                  </span>
                </div>
              </div>
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                {article.status}
              </span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:text-brand-red transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Upravljaj kategorijama', href: '/admin/settings', desc: 'Uredi redosled i vidljivost kategorija' },
          { label: 'Newsletter subscriberi', href: '/admin/settings', desc: '128 aktivnih pretplatnika' },
          { label: 'SEO pregled', href: '/admin/settings', desc: 'Optimizujte meta tagove za sve vesti' },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-brand-red transition-colors group"
          >
            <h3 className="font-semibold text-sm group-hover:text-brand-red transition-colors">{action.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
