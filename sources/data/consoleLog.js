import * as THREE from 'three/webgpu'

const text = `
██████╗ ██╗  ██╗    ██╗    ██╗ ██████╗ ██████╗ ██╗     ██████╗ 
██╔══██╗██║ ██╔╝    ██║    ██║██╔═══██╗██╔══██╗██║     ██╔══██╗
██████╔╝█████╔╝     ██║ █╗ ██║██║   ██║██████╔╝██║     ██║  ██║
██╔══██╗██╔═██╗     ██║███╗██║██║   ██║██╔══██╗██║     ██║  ██║
██║  ██║██║  ██╗    ╚███╔███╔╝╚██████╔╝██║  ██║███████╗██████╔╝
╚═╝  ╚═╝╚═╝  ╚═╝     ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═════╝ 

╔═ RK WORLD ════════════╗
║ Standalone 3D Browser Game
║ Created by: Rohith Kumar
║ Built upon Folio 2025 by Bruno Simon (MIT License)
║ Drive around, explore the world, and discover all secrets!
╚═══════════════════════╝

╔═ Controls ════════════╗
║ Drive      ⇒ WASD or Arrow Keys
║ Boost      ⇒ Left Shift
║ Brake      ⇒ Left Ctrl or B
║ Jump       ⇒ Space
║ Interact   ⇒ Enter
║ Map        ⇒ M
║ Mute Sound ⇒ L
║ Respawn    ⇒ R
║ Hydraulics ⇒ Number keys / Numpad
║ Camera     ⇒ Left Click Drag
╚═══════════════════════╝

╔═ Debug ═══════════════╗
║ Access debug mode by adding #debug at the end of the URL and reloading.
║ Press [V] to toggle the free camera.
╚═══════════════════════╝

╔═ Engine & Attribution ╗
║ Three.js (release: ${THREE.REVISION}) - https://threejs.org/
║ Physics  ⇒ Rapier 3D (https://rapier.rs/)
║ Audio    ⇒ Howler.js (https://howlerjs.com/)
║ Music    ⇒ Kounine (CC0 License)
║ Original Folio 2025 Engine by Bruno Simon (MIT License)
╚═══════════════════════╝
`
let finalText = ''
let finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #D66FFF; font: 400 1em monospace;',
}
let currentStyle = null
for(let i = 0; i < text.length; i++)
{
    const char = text[i]

    const style = char.match(/[╔║═╗╚╝╔╝]/) ? 'pipe' : 'letter'
    if(style !== currentStyle)
    {
        currentStyle = style
        finalText += '%c'

        finalStyles.push(stylesSet[currentStyle])
    }
    finalText += char
}

export default [finalText, ...finalStyles]
