import * as THREE from 'three/webgpu'
import { color, float, Fn, instancedArray, mix, normalWorld, positionGeometry, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { Inputs } from '../../Inputs/Inputs.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import { Area } from './Area.js'
import gsap from 'gsap'
import { MeshDefaultMaterial } from '../../Materials/MeshDefaultMaterial.js'

export class LandingArea extends Area
{
    constructor(model)
    {
        super(model)

        this.localTime = uniform(0)

        this.setLetters()
        this.setKiosk()
        this.setControls()
        this.setBonfire()
        this.setAchievement()
    }

    setLetters()
    {
        const letterObjects = []

        // 1. Check all references for any letter references
        for(const [key, items] of this.references.items.entries())
        {
            if(key.toLowerCase().includes('letter'))
            {
                for(const item of items)
                {
                    letterObjects.push(item)
                }
            }
        }

        // 2. Also check model children directly
        if(this.model && this.model.children)
        {
            for(const child of this.model.children)
            {
                if(child.name && child.name.toLowerCase().includes('letter') && !letterObjects.includes(child))
                {
                    letterObjects.push(child)
                }
            }
        }

        // 3. Hide all Bruno Simon 3D letters and disable their physics bodies
        for(const obj of letterObjects)
        {
            obj.visible = false
            if(obj.traverse)
            {
                obj.traverse(c => { c.visible = false })
            }

            if(obj.userData?.object?.visual?.object3D)
            {
                obj.userData.object.visual.object3D.visible = false
                obj.userData.object.visual.object3D.traverse(c => { c.visible = false })
            }

            if(obj.userData?.object?.physical?.body)
            {
                obj.userData.object.physical.body.setEnabled(false)
            }
        }

        // 4. Also scan scene directly to hide any letter meshes added to scene root
        const hideAllSceneLetters = () =>
        {
            if(this.game.scene)
            {
                for(const child of this.game.scene.children)
                {
                    if(child.name && child.name.toLowerCase().includes('letter'))
                    {
                        child.visible = false
                        child.traverse?.(c => { c.visible = false })
                        if(child.userData?.object?.physical?.body)
                        {
                            child.userData.object.physical.body.setEnabled(false)
                        }
                    }
                }
            }
        }
        hideAllSceneLetters()
        this.game.ticker.wait(5, hideAllSceneLetters)
        this.game.ticker.wait(60, hideAllSceneLetters)

        this.setExploreSign(letterObjects)
    }

    setExploreSign(letterObjects = [])
    {
        // Calculate center position
        const center = new THREE.Vector3(49.25, 3.27, 38.52)
        if(letterObjects.length > 0)
        {
            const sum = new THREE.Vector3()
            let count = 0
            for(const ref of letterObjects)
            {
                if(ref.position)
                {
                    sum.add(ref.position)
                    count++
                }
            }
            if(count > 0)
            {
                sum.divideScalar(count)
                center.copy(sum)
            }
        }

        // 3D Explore Sign Group
        const group = new THREE.Group()
        group.position.copy(center)
        group.position.y += 1.8
        group.rotation.y = 0.22

        // Canvas texture for sign
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 256
        const ctx = canvas.getContext('2d')

        // Background
        ctx.fillStyle = 'rgba(8, 14, 26, 0.96)'
        if(ctx.roundRect)
            ctx.roundRect(16, 16, 992, 224, 8)
        else
            ctx.fillRect(16, 16, 992, 224)
        ctx.fill()

        // Outer border - sharp electric blue
        ctx.strokeStyle = '#00d2ff'
        ctx.lineWidth = 6
        ctx.shadowColor = 'rgba(0, 210, 255, 0.6)'
        ctx.shadowBlur = 15
        if(ctx.roundRect)
            ctx.roundRect(16, 16, 992, 224, 8)
        else
            ctx.strokeRect(16, 16, 992, 224)
        ctx.stroke()

        // Inner glowing border - metallic cyan
        ctx.shadowBlur = 0
        ctx.strokeStyle = 'rgba(92, 225, 230, 0.5)'
        ctx.lineWidth = 2
        if(ctx.roundRect)
            ctx.roundRect(24, 24, 976, 208, 4)
        else
            ctx.strokeRect(24, 24, 976, 208)
        ctx.stroke()

        // Main text: EXPLORE THE ISLAND (Bold geometric gaming typography)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = '900 64px "Orbitron", "Rajdhani", sans-serif'
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = '#00d2ff'
        ctx.shadowBlur = 24
        ctx.fillText('EXPLORE THE ISLAND', 512, 102)

        // Subtitle: RK WORLD // CREATED BY ROHITH KUMAR
        ctx.shadowBlur = 0
        ctx.font = '700 20px "Rajdhani", sans-serif'
        ctx.fillStyle = '#8ba2be'
        ctx.letterSpacing = '4px'
        ctx.fillText('RK WORLD  //  CREATED BY ROHITH KUMAR', 512, 172)

        const canvasTexture = new THREE.CanvasTexture(canvas)
        canvasTexture.colorSpace = THREE.SRGBColorSpace
        canvasTexture.needsUpdate = true

        const geometry = new THREE.PlaneGeometry(8, 2)
        const material = new THREE.MeshBasicMaterial({
            map: canvasTexture,
            transparent: true,
            side: THREE.DoubleSide
        })

        const mesh = new THREE.Mesh(geometry, material)
        group.add(mesh)

        // Support posts
        const postGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8)
        const postMaterial = new THREE.MeshBasicMaterial({ color: 0x3d3047 })

        const leftPost = new THREE.Mesh(postGeometry, postMaterial)
        leftPost.position.set(-3.2, -0.6, 0)
        group.add(leftPost)

        const rightPost = new THREE.Mesh(postGeometry, postMaterial)
        rightPost.position.set(3.2, -0.6, 0)
        group.add(rightPost)

        this.game.scene.add(group)
    }

    setKiosk()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('kioskInteractivePoint')[0].position,
            'Map',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.modals.open('map')
                // interactivePoint.hide()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )

        // this.game.map.items.get('map').events.on('close', () =>
        // {
        //     interactivePoint.show()
        // })
    }

    setControls()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('controlsInteractivePoint')[0].position,
            'Controls',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.menu.open('controls')
                interactivePoint.hide()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )

        // Menu instance
        const menuInstance = this.game.menu.items.get('controls')

        menuInstance.events.on('close', () =>
        {
            interactivePoint.show()
        })

        menuInstance.events.on('open', () =>
        {
            if(this.game.inputs.mode === Inputs.MODE_GAMEPAD)
                menuInstance.tabs.goTo('gamepad')
            else if(this.game.inputs.mode === Inputs.MODE_MOUSEKEYBOARD)
                menuInstance.tabs.goTo('mouse-keyboard')
            else if(this.game.inputs.mode === Inputs.MODE_TOUCH)
                menuInstance.tabs.goTo('touch')
        })
    }

    setBonfire()
    {
        const position = this.references.items.get('bonfireHashes')[0].position

        // Particles
        let particles = null
        {
            const emissiveMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')
    
            const count = 30
            const elevation = uniform(5)
            const positions = new Float32Array(count * 3)
            const scales = new Float32Array(count)
    
    
            for(let i = 0; i < count; i++)
            {
                const i3 = i * 3
    
                const angle = Math.PI * 2 * Math.random()
                const radius = Math.pow(Math.random(), 1.5) * 1
                positions[i3 + 0] = Math.cos(angle) * radius
                positions[i3 + 1] = Math.random()
                positions[i3 + 2] = Math.sin(angle) * radius
    
                scales[i] = 0.02 + Math.random() * 0.06
            }
            
            const positionAttribute = instancedArray(positions, 'vec3').toAttribute()
            const scaleAttribute = instancedArray(scales, 'float').toAttribute()
    
            const material = new THREE.SpriteNodeMaterial()
            material.outputNode = emissiveMaterial.outputNode
    
            const progress = float(0).toVar()
    
            material.positionNode = Fn(() =>
            {
                const newPosition = positionAttribute.toVar()
                progress.assign(newPosition.y.add(this.localTime.mul(newPosition.y)).fract())
    
                newPosition.y.assign(progress.mul(elevation))
                newPosition.xz.addAssign(this.game.wind.direction.mul(progress))
    
                const progressHide = step(0.8, progress).mul(100)
                newPosition.y.addAssign(progressHide)
                
                return newPosition
            })()
            material.scaleNode = Fn(() =>
            {
                const progressScale = progress.remapClamp(0.5, 1, 1, 0)
                return scaleAttribute.mul(progressScale)
            })()
    
            const geometry = new THREE.CircleGeometry(0.5, 8)
    
            particles = new THREE.Mesh(geometry, material)
            particles.visible = false
            particles.position.copy(position)
            particles.count = count
            this.game.scene.add(particles)
        }

        // Hashes
        {
            const alphaNode = Fn(() =>
            {
                const baseUv = uv(1)
                const distanceToCenter = baseUv.sub(0.5).length()
    
                const voronoi = texture(
                    this.game.noises.voronoi,
                    baseUv
                ).g
    
                voronoi.subAssign(distanceToCenter.remap(0, 0.5, 0.3, 0))
    
                return voronoi
            })()
    
            const material = new MeshDefaultMaterial({
                colorNode: color(0x6F6A87),
                alphaNode: alphaNode,
                hasWater: false,
                hasLightBounce: false
            })
    
            const mesh = this.references.items.get('bonfireHashes')[0]
            mesh.material = material
        }

        // Burn
        const burn = this.references.items.get('bonfireBurn')[0]
        burn.visible = false

        // Interactive point
        this.game.interactivePoints.create(
            this.references.items.get('bonfireInteractivePoint')[0].position,
            'Res(e)t',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.reset()

                gsap.delayedCall(2, () =>
                {
                    // Bonfire
                    particles.visible = true
                    burn.visible = true
                    this.game.ticker.wait(2, () =>
                    {
                        particles.geometry.boundingSphere.center.y = 2
                        particles.geometry.boundingSphere.radius = 2
                    })

                    // Sound
                    this.game.audio.groups.get('campfire').items[0].positions.push(position)
                })
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'landing')
        })
        this.events.on('boundingOut', () =>
        {
            this.game.achievements.setProgress('landingLeave', 1)
        })
    }

    update()
    {
        this.localTime.value += this.game.ticker.deltaScaled * 0.1
    }
}