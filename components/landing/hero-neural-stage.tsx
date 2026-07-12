'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, CircuitBoard, MousePointer2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { Button } from '@/components/ui/button'
import { CountdownTimer } from '@/components/landing/countdown-timer'

const stats = [
  { value: '10+', label: 'Kompetisi' },
  { value: '2000+', label: 'Peserta' },
  { value: '100M+', label: 'Total Hadiah' },
]

const nodes = Array.from({ length: 68 }, (_, index) => {
  const ring = index % 4
  const angle = index * 2.399963
  const radius = 0.9 + ring * 0.58
  return {
    x: Math.cos(angle) * radius * 1.45,
    y: Math.sin(angle) * radius,
    z: Math.sin(index * 1.17) * 1.6,
  }
})

export function HeroNeuralStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 70, damping: 18 })
  const springY = useSpring(mouseY, { stiffness: 70, damping: 18 })
  const panelX = useTransform(springX, [-1, 1], [-16, 16])
  const panelY = useTransform(springY, [-1, 1], [-10, 10])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 6.8)

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const group = new THREE.Group()
    scene.add(group)

    const nodeGeometry = new THREE.SphereGeometry(0.055, 16, 16)
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: '#8AF275' })
    const hotMaterial = new THREE.MeshBasicMaterial({ color: '#FFE343' })
    nodes.forEach((node, index) => {
      const mesh = new THREE.Mesh(nodeGeometry, index % 9 === 0 ? hotMaterial : nodeMaterial)
      mesh.position.set(node.x, node.y, node.z)
      group.add(mesh)
    })

    const linePoints: number[] = []
    nodes.forEach((from, index) => {
      nodes.slice(index + 1).forEach((to) => {
        const distance = Math.hypot(from.x - to.x, from.y - to.y, from.z - to.z)
        if (distance < 1.05) linePoints.push(from.x, from.y, from.z, to.x, to.y, to.z)
      })
    })
    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePoints, 3))
    const lineMaterial = new THREE.LineBasicMaterial({ color: '#95B6FD', transparent: true, opacity: 0.34 })
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
    group.add(lines)

    const pointer = { x: 0, y: 0 }
    let frame = 0
    const startedAt = performance.now()

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      mouseX.set(pointer.x)
      mouseY.set(pointer.y)
    }

    const animate = () => {
      frame = requestAnimationFrame(animate)
      const time = (performance.now() - startedAt) * 0.001
      group.rotation.y += (pointer.x * 0.42 + time * 0.08 - group.rotation.y) * 0.035
      group.rotation.x += (pointer.y * 0.25 - group.rotation.x) * 0.045
      group.scale.setScalar(1 + Math.sin(time * 1.4) * 0.018)
      renderer.render(scene, camera)
    }

    resize()
    animate()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', move)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', move)
      nodeGeometry.dispose()
      nodeMaterial.dispose()
      hotMaterial.dispose()
      lineGeometry.dispose()
      lineMaterial.dispose()
      renderer.dispose()
    }
  }, [mouseX, mouseY])

  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#070814] px-6 py-16 text-white sm:px-10 lg:px-12">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(149,182,253,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(149,182,253,0.08)_1px,transparent_1px)] bg-[size:46px_46px]" />
      <div className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-[#A160D3]/25 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#E43636]/20 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8AF275] to-transparent" />

      <div className="relative mx-auto grid min-h-[calc(100vh-80px-80px)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-7"
        >
          <Image src="/brand/logo-white-text.svg" alt="ITB Insight" width={384} height={128} className="h-24 w-auto sm:h-32" priority />
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#8AF275]/40 bg-[#8AF275]/10 px-4 py-2 text-sm text-[#8AF275]">
            <CircuitBoard className="h-4 w-4" />
            Neural registration interface
          </div>

          <div className="space-y-5">
            <h1 className="font-heading max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Kompetisi teknologi untuk tim yang siap naik level.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[#dbe6ff] sm:text-lg">
              Ikuti rangkaian lomba ITB Insight 2026, bentuk tim terbaikmu, kirim pendaftaran, dan pantau status seleksi dari satu dashboard.
            </p>
          </div>

          <CountdownTimer />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-[#E43636] px-8 text-white hover:bg-[#C91111]">
              <Link href="/competitions">
                Lihat Kompetisi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-[#95B6FD]/50 bg-white/5 px-8 text-white hover:bg-white/10 hover:text-white">
              <Link href="/auth/login?next=/dashboard">Masuk ke Dashboard</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div style={{ x: panelX, y: panelY }} className="relative min-h-[460px] lg:min-h-[620px]">
          <div className="absolute inset-0 rounded-[2.5rem] border border-[#95B6FD]/20 bg-[#0b1026]/70 shadow-2xl shadow-[#35518D]/30 backdrop-blur" />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-crosshair" />
          <div className="pointer-events-none absolute left-6 top-6 rounded-full border border-[#FFE343]/30 bg-black/30 px-3 py-1 text-xs text-[#FFE343] backdrop-blur">
            Live neural map
          </div>
          <div className="pointer-events-none absolute bottom-6 left-6 right-6 grid gap-3 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.08, type: 'spring', stiffness: 140, damping: 18 }}
                className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur"
              >
                <div className="font-accent text-2xl font-black text-white">{stat.value}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.24em] text-[#95B6FD]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          <div className="pointer-events-none absolute right-6 top-6 flex items-center gap-2 rounded-full bg-[#A160D3]/15 px-3 py-1 text-xs text-[#e9d5ff]">
            <MousePointer2 className="h-3.5 w-3.5" /> move cursor
          </div>
        </motion.div>
      </div>
    </section>
  )
}
