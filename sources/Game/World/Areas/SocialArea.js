import * as THREE from 'three/webgpu'
import { InteractivePoints } from '../../InteractivePoints.js'
import socialData from '../../../data/social.js'
import { Area } from './Area.js'

export class SocialArea extends Area
{
    constructor(model)
    {
        super(model)

        const centerRef = this.references.items.get('center')?.[0]
        this.center = centerRef ? centerRef.position.clone() : new THREE.Vector3()

        this.hideUnwantedObjects()
        this.setLinks()
        this.setAchievement()

        this.statue = { down: false }
        this.fans = { visibleCount: 0, objects: [], instancedGroup: { needsUpdate: false, updateBoundings: () => {} } }
    }

    hideUnwantedObjects()
    {
        const unwantedPatterns = ['discord', 'onlyfans', 'github', 'statue', 'xphysical']

        // Hide objects created in Area.setObjects
        if(this.objects?.items)
        {
            for(const item of this.objects.items)
            {
                const name = (item.visual?.object3D?.name || '').toLowerCase()
                for(const pat of unwantedPatterns)
                {
                    if(name.includes(pat))
                    {
                        if(item.visual?.object3D)
                        {
                            item.visual.object3D.visible = false
                            item.visual.object3D.traverse(c => { c.visible = false })
                        }
                        if(item.physical?.body)
                        {
                            item.physical.body.setEnabled(false)
                        }
                    }
                }
            }
        }

        // Hide direct model children and references
        if(this.model?.children)
        {
            for(const child of this.model.children)
            {
                const name = (child.name || '').toLowerCase()
                for(const pat of unwantedPatterns)
                {
                    if(name.includes(pat))
                    {
                        child.visible = false
                        child.traverse(c => { c.visible = false })
                        if(child.userData?.object?.physical?.body)
                        {
                            child.userData.object.physical.body.setEnabled(false)
                        }
                    }
                }
            }
        }
    }

    setLinks()
    {
        const radius = 6
        let i = 0

        for(const link of socialData)
        {
            const angle = i * Math.PI / Math.max(1, socialData.length - 1)
            const position = this.center.clone()
            position.x += Math.cos(angle) * radius
            position.y = 1
            position.z -= Math.sin(angle) * radius

            this.game.interactivePoints.create(
                position,
                link.name,
                link.align === 'left' ? InteractivePoints.ALIGN_LEFT : InteractivePoints.ALIGN_RIGHT,
                InteractivePoints.STATE_CONCEALED,
                () =>
                {
                    if(link.menu)
                        this.game.menu.open(link.menu)
                    else if(link.modal)
                        this.game.modals.open(link.modal)
                    else if(link.url)
                        window.open(link.url, '_blank')
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

            i++
        }
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'social')
        })
    }

    update()
    {
    }
}
