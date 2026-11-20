import * as THREE from 'three/webgpu'
import { color, float, Fn, luminance, mix, positionGeometry, sin, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { Area } from './Area.js'
import gsap from 'gsap'

export class LabArea extends Area
{
    static DIRECTION_PREVIOUS = 1
    static DIRECTION_NEXT = 2
    static STATE_OPEN = 3
    static STATE_OPENING = 4
    static STATE_CLOSED = 5
    static STATE_CLOSING = 6

    constructor(model)
    {
        super(model)

        this.state = LabArea.STATE_CLOSED

        this.hidePresentationElements()
        this.setCandleFlames()
        this.setCauldron()
        this.setAchievement()
    }

    hidePresentationElements()
    {
        const hideGroup = (key) =>
        {
            const items = this.references.items.get(key)
            if(items)
            {
                for(const item of items)
                {
                    item.visible = false
                    if(item.traverse)
                        item.traverse(child => { child.visible = false })
                }
            }
        }

        hideGroup('blackBoard')
        hideGroup('blackboardLabelsGamepadPlaystation')
        hideGroup('blackboardLabelsGamepadXbox')
        hideGroup('blackboardLabelsMouseKeyboard')
        hideGroup('chainLeft')
        hideGroup('chainRight')
        hideGroup('chainPulley')
        hideGroup('gearA')
        hideGroup('gearB')
        hideGroup('gearC')
        hideGroup('mini')
        hideGroup('mecanism')
        hideGroup('screen')
        hideGroup('title')
        hideGroup('url')
        hideGroup('intersectUrl')
        hideGroup('intersectNext')
        hideGroup('intersectPrevious')
    }

    setCandleFlames()
    {
        const meshes = this.references.items.get('candleFlame') || []
        const baseMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')
        
        if(baseMaterial)
        {
            const material = new THREE.MeshBasicNodeMaterial({ transparent: true })
            material.outputNode = baseMaterial.outputNode
            material.positionNode = Fn(() =>
            {
                const newPosition = positionGeometry.toVar()
                const wave = sin(this.game.ticker.elapsedScaledUniform.mul(0.3).add(uv().y.mul(3)))
                const strength = uv().y.oneMinus().pow(2).mul(0.06)
                newPosition.x.addAssign(wave.mul(strength))
                return newPosition
            })()

            for(const mesh of meshes)
            {
                mesh.scale.setScalar(0)
                mesh.visible = false
                mesh.material = material
            }

            this.game.dayCycles?.events?.on('night', (inInterval) =>
            {
                if(inInterval)
                {
                    for(const mesh of meshes)
                    {
                        mesh.visible = true
                        gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 10, ease: 'power1.out', overwrite: true })
                    }
                }
                else
                {
                    for(const mesh of meshes)
                    {
                        gsap.to(mesh.scale, { x: 0, y: 0, z: 0, duration: 10, ease: 'power1.in', overwrite: true, onComplete: () =>
                        {
                            mesh.visible = false
                        } })
                    }
                }
            })
        }
    }

    setCauldron()
    {
        this.cauldron = {}

        const heatRef = this.references.items.get('heat')?.[0]
        if(heatRef)
        {
            const material = new THREE.MeshBasicNodeMaterial({ side: THREE.DoubleSide, transparent: true, depthTest: true, depthWrite: false })
            material.outputNode = Fn(() =>
            {
                const noiseUv = uv().mul(vec2(2, 0.2))
                noiseUv.y.addAssign(this.game.ticker.elapsedScaledUniform.mul(0.05))
                const noise = texture(this.game.noises.perlin, noiseUv).r
                const strength = noise.mul(uv().y.pow(2))
                const emissiveMix = strength.smoothstep(0, 1)
                const emissiveColor = mix(color('#ff3e00'), color('#ff8641'), emissiveMix).mul(strength.add(1).mul(2))
                return vec4(vec3(emissiveColor), strength)
            })()

            this.cauldron.heat = heatRef
            this.cauldron.heat.material = material
            this.cauldron.heat.castShadow = false
        }

        const woodRef = this.references.items.get('wood')?.[0]
        if(woodRef)
        {
            const baseMaterial = this.game.materials.getFromName('palette')
            if(baseMaterial)
            {
                const material = baseMaterial.clone()
                const colorA = uniform(color('#ff6b2b'))
                const colorB = uniform(color('#ff4100'))
                const intensity = uniform(1.25)

                const baseOutput = baseMaterial.outputNode
                material.outputNode = Fn(() =>
                {
                    const baseUv = uv(1).toVar()
                    const emissiveColor = mix(colorA, colorB, baseUv.sub(0.5).length().mul(2))
                    const emissiveOutput = emissiveColor.div(luminance(emissiveColor)).mul(intensity)
                    const mixStrength = baseUv.sub(0.5).length().mul(2).pow2()
                    const output = mix(baseOutput.rgb, emissiveOutput, mixStrength)
                    return vec4(output.rgb, 1)
                })()

                this.cauldron.wood = woodRef
                this.cauldron.wood.material = material
            }
        }

        const liquidRef = this.references.items.get('liquid')?.[0]
        if(liquidRef)
        {
            const colorA = uniform(color('#ff0083'))
            const colorB = uniform(color('#3018eb'))
            const intensity = uniform(1.7)

            const material = new THREE.MeshBasicNodeMaterial({ transparent: true })
            const mixedColor = mix(colorA, colorB, uv().sub(0.5).length().mul(2))
            material.colorNode = mixedColor.div(luminance(mixedColor)).mul(intensity)
            material.fog = false

            this.cauldron.liquid = { surface: liquidRef }
            this.cauldron.liquid.surface.material = material
        }
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'lab')
        })
    }

    open()
    {
        // Standalone game: portfolio experiment presentation is removed.
    }

    close()
    {
        this.state = LabArea.STATE_CLOSED
    }

    update()
    {
    }
}
