struct Body {
    pos        : vec2<f32>,
    vel        : vec2<f32>,
    mass       : f32,
    radius     : f32,
    body_type  : f32,
    _pad       : f32,
}

struct SimParams {
    dt           : f32,
    G            : f32,
    num_bodies   : u32,
    softening_sq : f32,
}

@group(0) @binding(0) var<storage, read>       bodies_in  : array<Body>;
@group(0) @binding(1) var<storage, read_write> bodies_out : array<Body>;
@group(0) @binding(2) var<uniform>             params     : SimParams;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    let i = gid.x;
    if (i >= params.num_bodies) { return; }

    var body = bodies_in[i];

    // Suns are fixed anchors — zero velocity, copy through
    if (body.body_type == 1.0) {
        body.vel = vec2<f32>(0.0, 0.0);
        bodies_out[i] = body;
        return;
    }

    var acc = vec2<f32>(0.0, 0.0);

    for (var j = 0u; j < params.num_bodies; j++) {
        if (j == i) { continue; }
        let other = bodies_in[j];
        if (other.mass <= 0.0) { continue; }

        let diff    = other.pos - body.pos;
        let dist_sq = dot(diff, diff) + params.softening_sq;
        // a = G * m_j / r^3 * diff  (= G*m_j*r_hat/r^2, r_hat = diff/r)
        let inv_dist = inverseSqrt(dist_sq);
        let a_mag    = params.G * other.mass * inv_dist * inv_dist * inv_dist;
        acc += diff * a_mag;
    }

    // Semi-implicit Euler integration
    body.vel += acc * params.dt;
    body.pos += body.vel * params.dt;
    bodies_out[i] = body;
}
