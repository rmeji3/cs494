struct Body {
    pos        : vec2<f32>,
    vel        : vec2<f32>,
    mass       : f32,
    radius     : f32,
    body_type  : f32,
    _pad       : f32,
}

struct RenderParams {
    canvas_width  : f32,
    canvas_height : f32,
    _pad1         : f32,
    _pad2         : f32,
}

@group(0) @binding(0) var<storage, read> bodies : array<Body>;
@group(0) @binding(1) var<uniform>       params : RenderParams;

struct VertexOut {
    @builtin(position)                  clip_pos  : vec4<f32>,
    @location(0)                        uv        : vec2<f32>,
    @location(1) @interpolate(flat)     body_type : f32,
}

// Returns the local UV corner for a 2-triangle quad (6 vertices)
fn quad_vert(vid: u32) -> vec2<f32> {
    if (vid == 0u) { return vec2<f32>(-1.0, -1.0); }
    if (vid == 1u) { return vec2<f32>( 1.0, -1.0); }
    if (vid == 2u) { return vec2<f32>(-1.0,  1.0); }
    if (vid == 3u) { return vec2<f32>(-1.0,  1.0); }
    if (vid == 4u) { return vec2<f32>( 1.0, -1.0); }
    return vec2<f32>(1.0, 1.0);
}

@vertex
fn vs_main(
    @builtin(vertex_index)   vid : u32,
    @builtin(instance_index) iid : u32,
) -> VertexOut {
    let body  = bodies[iid];
    let local = quad_vert(vid);

    // World-space position: body center + scaled quad corner
    let world_pos = body.pos + local * body.radius;

    // World → clip (origin at canvas center, Y flipped for screen coords)
    let cx = world_pos.x / (params.canvas_width  * 0.5);
    let cy = -world_pos.y / (params.canvas_height * 0.5);

    var out : VertexOut;
    out.clip_pos  = vec4<f32>(cx, cy, 0.0, 1.0);
    out.uv        = local;
    out.body_type = body.body_type;
    return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4<f32> {
    let dist = length(in.uv);
    if (dist > 1.0) { discard; }

    let t = in.body_type;
    var color: vec3<f32>;

    if (t < 0.5) {
        // Planet — steel blue
        color = vec3<f32>(0.30, 0.55, 1.00);
    } else if (t < 1.5) {
        // Sun — gold with inner glow
        let glow = (1.0 - dist) * (1.0 - dist);
        color = vec3<f32>(1.00, 0.80 + glow * 0.15, 0.10 + glow * 0.30);
    } else if (t < 2.5) {
        // Moon — light grey
        color = vec3<f32>(0.65, 0.65, 0.68);
    } else if (t < 3.5) {
        // Spaceship — bright green
        color = vec3<f32>(0.20, 0.90, 0.40);
    } else {
        // Meteorite — burnt orange
        color = vec3<f32>(0.85, 0.45, 0.10);
    }

    return vec4<f32>(color, 1.0);
}
