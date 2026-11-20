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

// Patch WebGPUBackend._draw and WebGLBackend._draw to ensure drawParams are always valid unsigned longs
const sanitizeDrawParams = (drawParams, renderObject) =>
{
    if(drawParams)
    {
        if(typeof drawParams.vertexCount !== 'number' || isNaN(drawParams.vertexCount) || drawParams.vertexCount < 0)
        {
            drawParams.vertexCount = 0
        }
        else
        {
            drawParams.vertexCount = Math.floor(drawParams.vertexCount)
        }

        if(typeof drawParams.instanceCount !== 'number' || isNaN(drawParams.instanceCount) || drawParams.instanceCount < 1)
        {
            drawParams.instanceCount = 1
        }
        else
        {
            drawParams.instanceCount = Math.floor(drawParams.instanceCount)
        }

        if(typeof drawParams.firstVertex !== 'number' || isNaN(drawParams.firstVertex) || drawParams.firstVertex < 0)
        {
            drawParams.firstVertex = 0
        }
        else
        {
            drawParams.firstVertex = Math.floor(drawParams.firstVertex)
        }
    }
}

if(THREE.WebGPUBackend && THREE.WebGPUBackend.prototype._draw)
{
    const originalDraw = THREE.WebGPUBackend.prototype._draw
    THREE.WebGPUBackend.prototype._draw = function(renderObject, info, renderContextData, pipelineGPU, bindings, vertexBuffers, drawParams, passEncoderGPU, currentSets, cameraIndexSlot = -1)
    {
        sanitizeDrawParams(drawParams, renderObject)
        return originalDraw.call(this, renderObject, info, renderContextData, pipelineGPU, bindings, vertexBuffers, drawParams, passEncoderGPU, currentSets, cameraIndexSlot)
    }
}

if(THREE.WebGLBackend && THREE.WebGLBackend.prototype._draw)
{
    const originalDrawWebGL = THREE.WebGLBackend.prototype._draw
    THREE.WebGLBackend.prototype._draw = function(renderObject, info, renderContextData, pipelineGPU, bindings, vertexBuffers, drawParams, passEncoderGPU, currentSets, cameraIndexSlot = -1)
    {
        sanitizeDrawParams(drawParams, renderObject)
        return originalDrawWebGL.call(this, renderObject, info, renderContextData, pipelineGPU, bindings, vertexBuffers, drawParams, passEncoderGPU, currentSets, cameraIndexSlot)
    }
}
