import * as THREE from 'three/webgpu'
import { color, Fn, luminance, mix, texture, uniform, uv, vec4 } from 'three/tsl'
import { MeshDefaultMaterial } from '../../Materials/MeshDefaultMaterial.js'
import { Area } from './Area.js'

export class ProjectsArea extends Area
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

        this.state = ProjectsArea.STATE_CLOSED

        this.setSounds()
        this.hidePortfolioElements()
        this.setOven()
        this.setGrinder()
        this.setAnvil()
        this.setAchievement()
    }

    setSounds()
    {
        this.sounds = {}
        const anvilRef = this.references.items.get('anvil')?.[0]
        const anvilPos = anvilRef ? anvilRef.position : new THREE.Vector3()

        this.sounds.anvil = this.game.audio.register({
            path: 'sounds/anvil/METLImpt_Anvil Single Hammer Strike Hammers_GENHD1-01372.mp3',
            autoplay: false,
            loop: false,
            volume: 0.5,
            antiSpam: 0.1,
            positions: anvilPos,
            distanceFade: 18,
            onPlay: (item) =>
            {
                item.volume = 0.1 + Math.random() * 0.1
                item.rate = 1 + Math.random() * 0.02
            }
        })
    }

    hidePortfolioElements()
    {
        const hideGroup = (key) =>
        {
            const items = this.references.items.get(key)
            if(items)
            {
                for(const item of items)
                {
                    item.visible = false
                    item.traverse(child => { child.visible = false })
                }
            }
        }

        hideGroup('blackBoard')
        hideGroup('blackboardLabelsGamepadPlaystation')
        hideGroup('blackboardLabelsGamepadXbox')
        hideGroup('blackboardLabelsMouseKeyboard')
        hideGroup('distinctions')
        hideGroup('screen')
        hideGroup('title')
        hideGroup('url')
        hideGroup('pagination')
        hideGroup('intersectUrl')
        hideGroup('intersectNext')
        hideGroup('intersectPrevious')
        hideGroup('intersectPagination')
    }

    setOven()
    {
        this.oven = {}

        const blowerRefs = this.references.items.get('blower')
        this.oven.blower = blowerRefs ? blowerRefs[0] : null

        const charcoalRefs = this.references.items.get('charcoal')
        this.oven.charcoal = charcoalRefs ? charcoalRefs[0] : null

        this.oven.threshold = uniform(0.2)

        if(this.oven.charcoal)
        {
            const alphaNode = Fn(() =>
            {
                const baseUv = uv()
                const voronoi = texture(
                    this.game.noises.voronoi,
                    baseUv
                ).g
                voronoi.subAssign(this.oven.threshold)
                return voronoi
            })()

            const material = new MeshDefaultMaterial({
                colorNode: color(0x6F6A87),
                alphaNode: alphaNode,
                hasWater: false,
                hasLightBounce: false
            })

            this.oven.charcoal.material = material
        }
    }

    setGrinder()
    {
        const grinderRefs = this.references.items.get('grinder')
        this.grinder = grinderRefs ? grinderRefs[0] : null
    }

    setAnvil()
    {
        this.anvil = {}
        this.anvil.frequency = 1
        this.anvil.loopTime = 0

        const hammerRefs = this.references.items.get('hammer')
        this.anvil.hammer = hammerRefs ? hammerRefs[0] : null
        if(this.anvil.hammer)
        {
            this.anvil.hammer.rotation.reorder('ZXY')
        }

        const bladeRefs = this.references.items.get('blade')
        this.anvil.blade = bladeRefs ? bladeRefs[0] : null

        if(this.anvil.blade)
        {
            const material = new MeshDefaultMaterial({
                colorNode: color('#a88c7f')
            })

            const colorA = uniform(color('#ff8641'))
            const colorB = uniform(color('#ff3e00'))
            const intensity = uniform(1.7)

            const baseOutput = material.outputNode
            material.outputNode = Fn(() =>
            {
                const baseUv = uv(1).toVar()

                const emissiveColor = mix(colorA, colorB, uv().sub(0.5).length().mul(10))
                const emissiveOutput = emissiveColor.div(luminance(emissiveColor)).mul(intensity)

                const mixStrength = baseUv.y.smoothstep(0.4, 0.9)
                const output = mix(baseOutput.rgb, emissiveOutput, mixStrength)

                return vec4(output.rgb, 1)
            })()

            this.anvil.blade.material = material
        }
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'projects')
            this.game.achievements.setProgress('projects', 1)
        })
    }

    open()
    {
        // Standalone game: portfolio view is removed.
    }

    close()
    {
        this.state = ProjectsArea.STATE_CLOSED
    }

    update()
    {
        // Oven
        if(this.oven.blower)
        {
            this.oven.blower.scale.y = (Math.sin(this.game.ticker.elapsedScaled) * 0.2 + 0.8)
        }
        if(this.oven.threshold)
        {
            this.oven.threshold.value = - Math.sin(this.game.ticker.elapsedScaled - 0.5) * 0.1 + 0.25
        }

        // Grinder
        if(this.grinder)
        {
            this.grinder.rotation.z = - this.game.ticker.elapsedScaled * 0.75
        }

        // Anvil
        if(this.anvil.hammer)
        {
            const time = this.game.ticker.elapsedScaled * this.anvil.frequency + Math.PI * 0.25
            this.anvil.hammer.rotation.x = Math.pow(1 - Math.abs(Math.sin(time)), 5) - 1

            const loopTime = ((time) / Math.PI) % 1
            if(loopTime < this.anvil.loopTime && this.sounds?.anvil)
            {
                this.sounds.anvil.play()
            }
            this.anvil.loopTime = loopTime
        }
    }
}
