import * as THREE from 'three/webgpu'

THREE.Object3D.prototype.copy = function( source, recursive = true )
{
    this.name = source.name;

    this.up.copy( source.up );

    this.position.copy( source.position );
    this.rotation.order = source.rotation.order;
    this.quaternion.copy( source.quaternion );
    this.scale.copy( source.scale );

    this.matrix.copy( source.matrix );
    this.matrixWorld.copy( source.matrixWorld );

    this.matrixAutoUpdate = source.matrixAutoUpdate;

    this.matrixWorldAutoUpdate = source.matrixWorldAutoUpdate;
    this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

    this.layers.mask = source.layers.mask;
    this.visible = source.visible;

    this.castShadow = source.castShadow;
    this.receiveShadow = source.receiveShadow;

    this.frustumCulled = source.frustumCulled;
    this.renderOrder = source.renderOrder;

    this.animations = source.animations.slice();

    // this.userData = JSON.parse( JSON.stringify( source.userData ) );

    if ( recursive === true ) {

        for ( let i = 0; i < source.children.length; i ++ ) {

            const child = source.children[ i ];
            this.add( child.clone() );

        }

    }

    return this;

}

// Patch WebGPUBackend._draw to ensure drawParams are always valid unsigned longs
if(THREE.WebGPUBackend && THREE.WebGPUBackend.prototype._draw)
{
    const originalDraw = THREE.WebGPUBackend.prototype._draw
    THREE.WebGPUBackend.prototype._draw = function(renderObject, info, renderContextData, pipelineGPU, bindings, vertexBuffers, drawParams, passEncoderGPU, currentSets, cameraIndexSlot = -1)
    {
        if(drawParams)
        {
            if(typeof drawParams.vertexCount !== 'number' || isNaN(drawParams.vertexCount) || drawParams.vertexCount < 0)
            {
                console.warn('Sanitizing invalid vertexCount:', drawParams.vertexCount, 'on object:', renderObject.object?.name, renderObject.object)
                drawParams.vertexCount = 0
            }
            else
            {
                drawParams.vertexCount = Math.floor(drawParams.vertexCount)
            }

            if(typeof drawParams.instanceCount !== 'number' || isNaN(drawParams.instanceCount) || drawParams.instanceCount < 1)
            {
                console.warn('Sanitizing invalid instanceCount:', drawParams.instanceCount, 'on object:', renderObject.object?.name, renderObject.object)
                drawParams.instanceCount = 1
            }
            else
            {
                drawParams.instanceCount = Math.floor(drawParams.instanceCount)
            }

            if(typeof drawParams.firstVertex !== 'number' || isNaN(drawParams.firstVertex) || drawParams.firstVertex < 0)
            {
                console.warn('Sanitizing invalid firstVertex:', drawParams.firstVertex, 'on object:', renderObject.object?.name, renderObject.object)
                drawParams.firstVertex = 0
            }
            else
            {
                drawParams.firstVertex = Math.floor(drawParams.firstVertex)
            }
        }

        return originalDraw.call(this, renderObject, info, renderContextData, pipelineGPU, bindings, vertexBuffers, drawParams, passEncoderGPU, currentSets, cameraIndexSlot)
    }
}
