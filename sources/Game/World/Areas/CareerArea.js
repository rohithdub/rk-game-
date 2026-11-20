import * as THREE from 'three/webgpu'
import { Area } from './Area.js'

export class CareerArea extends Area
{
    constructor(references)
    {
        super(references)

        this.setLines()
        this.setYears()
        this.setAchievement()
    }

    setLines()
    {
        this.lines = {}
        this.lines.items = []
        
        const lineGroups = this.references.items.get('line') || []

        for(const group of lineGroups)
        {
            const stone = group.children.find(child => child.name.startsWith('stone'))
            if(stone)
            {
                stone.position.y = 0
                // Hide career employer text
                const textMesh = stone.children.find(child => child.name.startsWith('careerText'))
                if(textMesh)
                {
                    textMesh.visible = false
                    textMesh.castShadow = false
                    textMesh.receiveShadow = false
                }
            }
        }
    }

    setYears()
    {
        const yearGroups = this.references.items.get('year') || []
        if(yearGroups.length > 0)
        {
            this.yearGroup = yearGroups[0]
            this.yearGroup.visible = false
            for(const child of this.yearGroup.children)
            {
                child.visible = false
            }
        }
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'career')
        })
    }

    update()
    {
        // Career timeline is completely removed. Stones remain static terrain.
    }
}
