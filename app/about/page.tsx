'use client'

import { motion } from 'framer-motion'
import { Target, Lightbulb, Users, Award, Handshake, MapPin } from 'lucide-react'

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 sm:px-10 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Tentang Kami</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">ITB Insight 2026</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
            Tech exhibition terbesar kedua di Institut Teknologi Bandung yang menyelenggarakan kompetisi, workshop, dan pameran teknologi tingkat nasional.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-2 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants} className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
              <Target className="h-7 w-7 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Visi Kami</h2>
            <p className="text-slate-600 leading-relaxed">
              Memajukan inovasi teknologi untuk masa depan yang berkelanjutan melalui kolaborasi mahasiswa, akademisi, dan industri di seluruh Indonesia.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-3xl bg-indigo-600 p-8 shadow-sm text-white">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Lightbulb className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Misi Kami</h2>
            <ul className="space-y-3 text-indigo-100">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white flex-shrink-0" />
                Memberikan platform kompetisi berstandar tinggi.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white flex-shrink-0" />
                Mewadahi showcase inovasi karya anak bangsa.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white flex-shrink-0" />
                Menghubungkan talenta muda dengan partner industri.
              </li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="mb-10 text-center">
            <h3 className="text-2xl font-bold text-slate-900">Pencapaian Kami</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { icon: Users, label: 'Peserta Seluruh Indonesia', value: '2,000+' },
              { icon: Award, label: 'Kompetisi & Lomba', value: '15+' },
              { icon: Handshake, label: 'Partner Industri', value: '50+' },
            ].map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
                  <stat.icon className="h-8 w-8 text-indigo-500" />
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
