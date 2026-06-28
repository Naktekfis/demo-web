'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles, Users } from 'lucide-react'

const highlights = [
  {
    icon: Sparkles,
    title: "Pilih cabang lomba",
    description: "Lihat kategori kompetisi, persyaratan, dan detail pendaftaran dalam satu tempat.",
  },
  {
    icon: Users,
    title: "Daftarkan tim",
    description: "Isi data ketua dan anggota tim tanpa bolak-balik formulir manual.",
  },
  {
    icon: CheckCircle2,
    title: "Pantau verifikasi",
    description: "Cek status pendaftaran dan tiket peserta begitu registrasi diproses panitia.",
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
            className="rounded-2xl border border-[#95B6FD]/30 bg-white p-8 transition-shadow duration-300 hover:shadow-xl"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#8AF275]/15">
              <Icon className="h-6 w-6 text-[#56B444]" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-slate-600">{item.description}</p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
