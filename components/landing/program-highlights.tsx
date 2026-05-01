'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles, Users } from 'lucide-react'

const highlights = [
  {
    icon: Sparkles,
    title: "Pendaftaran mudah",
    description: "Alur registrasi yang simpel dan intuitif untuk peserta.",
  },
  {
    icon: Users,
    title: "Manajemen tim",
    description: "Kelola anggota tim dengan form yang user-friendly.",
  },
  {
    icon: CheckCircle2,
    title: "Status real-time",
    description: "Pantau status pendaftaran secara real-time di dashboard.",
  },
]

export function ProgramHighlights() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
    <motion.div
      className="grid gap-8 md:grid-cols-3"
      initial="hidden"
      whileInView="visible"
      variants={containerVariants}
      viewport={{ once: true, margin: '-100px' }}
    >
      {highlights.map((item, idx) => {
        const Icon = item.icon
        return (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-8 transition-shadow duration-300 hover:shadow-xl"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <Icon className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-slate-600">{item.description}</p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
