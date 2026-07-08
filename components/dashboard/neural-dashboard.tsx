'use client'

import { motion } from 'framer-motion'
import { Activity, BrainCircuit, MousePointer2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

type NeuralDashboardProps = {
  registrationCount: number
  pendingCount: number
  verifiedCount: number
}

const nodes = Array.from({ length: 42 }, (_, index) => {
  const layer = index % 6
  const row = Math.floor(index / 6)
  return {
    id: index,
    label: ['Input', 'Planning', 'Team', 'Review', 'Verify', 'Launch'][layer],
    x: (layer - 2.5) * 1.15,
    y: (row - 3) * 0.72 + Math.sin(index) * 0.25,
    z: Math.cos(index * 1.7) * 1.35,
  }
})

export function NeuralDashboard({ registrationCount, pendingCount, verifiedCount }: NeuralDashboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedNode, setSelectedNode] = useState(nodes[0])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0.2, 8)

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const group = new THREE.Group()
    scene.add(group)

    const nodeMaterial = new THREE.MeshBasicMaterial({ color: '#67e8f9' })
    const hotMaterial = new THREE.MeshBasicMaterial({ color: '#f8fafc' })
    const geometry = new THREE.SphereGeometry(0.075, 16, 16)
    const nodeMeshes = nodes.map((node) => {
      const mesh = new THREE.Mesh(geometry, node.id === selectedNode.id ? hotMaterial : nodeMaterial)
      mesh.position.set(node.x, node.y, node.z)
      mesh.userData.node = node
      group.add(mesh)
      return mesh
    })

    const linePoints: number[] = []
    nodes.forEach((from, index) => {
      nodes.slice(index + 1).forEach((to) => {
        if (Math.abs(from.x - to.x) < 1.4 && Math.abs(from.y - to.y) < 1.2) {
          linePoints.push(from.x, from.y, from.z, to.x, to.y, to.z)
        }
      })
    })
    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePoints, 3))
    const lines = new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({ color: '#818cf8', transparent: true, opacity: 0.28 }),
    )
    group.add(lines)

    const pointer = new THREE.Vector2()
    const raycaster = new THREE.Raycaster()
    let hovered: THREE.Mesh | null = null
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
    }

    const click = () => {
      if (hovered?.userData.node) setSelectedNode(hovered.userData.node)
    }

    const animate = () => {
      frame = requestAnimationFrame(animate)
      const time = (performance.now() - startedAt) * 0.001
      group.rotation.y += (pointer.x * 0.35 - group.rotation.y) * 0.06
      group.rotation.x += (pointer.y * 0.22 - group.rotation.x) * 0.06
      group.position.y = Math.sin(time) * 0.08

      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(nodeMeshes, false)[0]?.object as THREE.Mesh | undefined
      if (hit !== hovered) {
        if (hovered) hovered.scale.setScalar(1)
        hovered = hit ?? null
        if (hovered) hovered.scale.setScalar(1.8)
      }

      renderer.render(scene, camera)
    }

    resize()
    animate()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('click', click)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('click', click)
      geometry.dispose()
      nodeMaterial.dispose()
      hotMaterial.dispose()
      lineGeometry.dispose()
      ;(lines.material as THREE.Material).dispose()
      renderer.dispose()
    }
  }, [selectedNode.id])

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-[2.5rem] border border-[#95B6FD]/30 bg-[#070814] text-white shadow-2xl shadow-[#35518D]/25"
    >
      <div className="relative grid min-h-[560px] gap-8 overflow-hidden p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(149,182,253,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(149,182,253,0.08)_1px,transparent_1px)] bg-[size:42px_42px]" />
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#A160D3]/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#E43636]/15 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, type: 'spring', stiffness: 110, damping: 18 }}
          className="relative min-h-[380px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b1026]/70 shadow-2xl shadow-[#35518D]/20 backdrop-blur"
        >
          <canvas ref={canvasRef} className="h-full min-h-[360px] w-full cursor-crosshair" />
          <div className="pointer-events-none absolute left-5 top-5 rounded-full border border-[#8AF275]/25 bg-black/30 px-3 py-1 text-xs text-[#8AF275] backdrop-blur">
            Mouse reactive neural map
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, type: 'spring', stiffness: 130, damping: 20 }}
          className="relative flex flex-col justify-between gap-8"
        >
          <div className="space-y-5">
            <motion.p whileHover={{ scale: 1.03 }} className="inline-flex items-center gap-2 rounded-full bg-[#8AF275]/10 px-3 py-1 text-sm font-medium text-[#8AF275]">
              <BrainCircuit className="h-4 w-4" /> Main Dashboard
            </motion.p>
            <div>
              <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">Dashboard Peserta</h1>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Pantau pendaftaran, status verifikasi, dan tiket kompetisi ITB Insight dalam satu tampilan.
              </p>
            </div>
          </div>

          <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 190, damping: 22 }}
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-300">Selected node</p>
                <h2 className="mt-1 text-2xl font-semibold">Alur {selectedNode.label}</h2>
              </div>
              <MousePointer2 className="h-6 w-6 text-cyan-200" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <motion.div whileHover={{ scale: 1.04 }} className="rounded-2xl bg-slate-950/50 p-3">
                <p className="text-2xl font-bold">{registrationCount}</p>
                <p className="text-xs text-slate-400">Aktif</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} className="rounded-2xl bg-slate-950/50 p-3">
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-slate-400">Submitted</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} className="rounded-2xl bg-slate-950/50 p-3">
                <p className="text-2xl font-bold">{verifiedCount}</p>
                <p className="text-xs text-slate-400">Verified</p>
              </motion.div>
            </div>
          </motion.div>

          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Activity className="h-4 w-4 text-emerald-300" />
            Gerakkan mouse untuk membaca alur registrasi secara interaktif.
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
