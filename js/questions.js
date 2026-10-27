const QUESTIONS = [
    'Can a design still be considered good if many people don’t understand it?',
    'What is the hardest ability for a designer to be replaced for?',
    'Among technical skills, taste, ideas, communication, and judgment, which one determines how far a designer can go?',
    'What makes a good idea? Is it about being new, being accurate, or actually solving a problem?',
    'If an idea is never realized, can it still be a good idea?',
    'Are good ideas “thought up,” or are they slowly discovered through a lot of work?',
    'Why are some very simple ideas more powerful than complicated ones?',
    'If a principle can never be broken, is it still a design principle?',
    'Is there a universal standard for “good design,” or does it always depend on context?',
    'Is having a style an asset or a limitation?',
    'How do you know whether you are developing a method or simply repeating yourself?',
    'Is design a profession, a craft, an art form, or a way of thinking?',
    'Why is it harder for bigger companies to make bold design decisions?',
    'Why can an idea that everyone agrees is good still never happen?',
    'What happens to a good idea once it enters an organization?',
    'At what point does an idea slowly get watered down?',
    'Should designers learn how to convince a company, or accept that the company itself is part of the design constraint?',
    'How much energy should a designer spend on designing, and how much on making the design actually happen?',
    'Why don’t some highly capable people become leaders?',
    'What kind of person naturally becomes a leader within a team?',
    'Is leadership about getting people to listen to you, or getting people to want to take action?',
    'Should a designer know a little bit of everything, or go extremely deep into one thing?',
    'Are “all-around designers” actually needed?',
    'If you work across many different areas, is there a risk of knowing a lot but having nothing that truly feels like your own?',
    'When should you expand your abilities, and when should you say no to something new?',
    'How do you know whether an opportunity is expanding you or distracting you?',
    'Do we need a clearly defined professional identity?',
    'Do traditional design methods still need to exist?',
    'What has become more important because of AI?',
    'If AI can imitate almost any style, does having a “personal style” still matter?',
    'Why do people become emotionally attached to skills they spent years learning?',
    'When a skill is no longer scarce, do we start emphasizing its “handmade value” even more?',
    'What makes a good teacher?',
    'Should a good teacher give answers, or create questions?',
    'Why are some teachers who don’t produce much work themselves still very good at helping students?',
    'Is teaching about transferring knowledge, or directing attention?',
    'How do you help someone truly learn something instead of simply understanding it?',
    'Should teachers teach students their own methods, or help students move beyond those methods?',
    'Why do people want to learn from certain people?',
    'Is it because that person is “good at what they do,” or because they represent a way of living that others want to move toward?',
    'As future designers, what can we do that is genuinely valuable?',
    'What kind of life do I actually want?',
    'Does being busy mean being productive, or does it simply mean having no time to think?',
    'Why do we feel guilty when we are “not working”?',
    'Why does rest need to prove that it is useful?',
    'How do I know whether I genuinely enjoy being busy, or whether I have simply become used to it?',
    'Why does free time sometimes feel relaxing, but other times make us anxious?',
    'Is it possible to maintain a “good state” for a long time, or are our states supposed to keep changing?',
    'Can someone live a good life without constantly trying to “improve” themselves?',
    'Why do young designers often feel that their projects are “not important enough”?'
];

const stage = document.getElementById('questions-stage');
const motionToggle = document.getElementById('motion-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const bodies = [];
let stageWidth = 0;
let stageHeight = 0;
let lastTime = performance.now();
let activeBody = null;
let pointerOffset = { x: 0, y: 0 };
let previousPointer = { x: 0, y: 0, time: 0 };
let pointerStart = { x: 0, y: 0 };
let dragMoved = false;
let motionEnabled = false;
let tiltX = 0;
let tiltY = 0;
let shakeX = 0;
let shakeY = 0;
let scrollGuardFrame = 0;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function withDeadZone(value, threshold) {
    return Math.abs(value) < threshold ? 0 : value;
}

function handleOrientation(event) {
    const gamma = Number.isFinite(event.gamma) ? event.gamma : 0;
    const beta = Number.isFinite(event.beta) ? event.beta : 0;
    tiltX = withDeadZone(clamp(gamma, -35, 35), 2) / 35;
    tiltY = withDeadZone(clamp(beta, -35, 35), 3) / 35;
}

function handleMotion(event) {
    const acceleration = event.acceleration;
    if (!acceleration) return;
    const nextX = withDeadZone(acceleration.x || 0, 0.9);
    const nextY = withDeadZone(acceleration.y || 0, 0.9);
    shakeX = clamp(shakeX * 0.8 + nextX * 0.2, -5, 5);
    shakeY = clamp(shakeY * 0.8 - nextY * 0.2, -5, 5);
}

function stopMotion() {
    window.removeEventListener('deviceorientation', handleOrientation);
    window.removeEventListener('devicemotion', handleMotion);
    motionEnabled = false;
    tiltX = 0;
    tiltY = 0;
    shakeX = 0;
    shakeY = 0;
    motionToggle.setAttribute('aria-pressed', 'false');
    motionToggle.textContent = 'MOTION';
}

async function startMotion() {
    const permissionRequests = [];
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        permissionRequests.push(DeviceMotionEvent.requestPermission());
    }
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        permissionRequests.push(DeviceOrientationEvent.requestPermission());
    }

    const permissions = await Promise.all(permissionRequests);
    if (permissions.some((permission) => permission !== 'granted')) throw new Error('Motion permission denied');

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('devicemotion', handleMotion);
    motionEnabled = true;
    motionToggle.setAttribute('aria-pressed', 'true');
    motionToggle.textContent = 'MOTION ON';
}

motionToggle.addEventListener('click', async () => {
    if (motionEnabled) {
        stopMotion();
        return;
    }
    try {
        await startMotion();
    } catch (error) {
        motionToggle.textContent = 'ALLOW MOTION';
    }
});

function breakEgg(body) {
    if (body.broken) return;
    body.angularVelocity = 0;
    body.rotationPaused = true;
    body.cracks += 1;
    body.element.classList.add(`crack-${Math.min(body.cracks, 3)}`);

    if (body.cracks < 3) return;

    body.broken = true;
    body.vx = 0;
    body.vy = 0;
    body.angularVelocity = 0;
    body.element.querySelector('.egg-cracks')?.remove();
    body.element.classList.add('is-breaking');
    body.element.setAttribute('aria-label', `Question ${body.index + 1}: ${QUESTIONS[body.index]}`);

    const fragmentDirections = [
        [-34, -28, -24], [28, -36, 20], [-46, 2, -38], [42, 4, 34],
        [-30, 38, 26], [34, 42, -20], [-8, -48, 8], [10, 50, -10]
    ];
    fragmentDirections.forEach(([x, y, rotation], index) => {
        const fragment = document.createElement('span');
        fragment.className = 'egg-fragment';
        fragment.setAttribute('aria-hidden', 'true');
        fragment.style.setProperty('--fragment-x', `${x}px`);
        fragment.style.setProperty('--fragment-y', `${y}px`);
        fragment.style.setProperty('--fragment-rotation', `${rotation}deg`);
        fragment.style.setProperty('--fragment-delay', `${index * 16}ms`);
        body.element.appendChild(fragment);
    });

    window.setTimeout(() => {
        body.element.classList.remove('is-breaking');
        body.element.classList.add('is-broken');
    }, 360);
}

function refreshBounds() {
    const rect = stage.getBoundingClientRect();
    stageWidth = rect.width;
    stageHeight = stage.offsetHeight;
}

function updateBodySize(body) {
    body.w = body.element.offsetWidth;
    body.h = body.element.offsetHeight;
}

function createBodies() {
    QUESTIONS.forEach((question, index) => {
        const element = document.createElement('article');
        element.className = 'question-card';
        if (question.length > 120) {
            element.classList.add('has-long-question');
        } else if (question.length > 88) {
            element.classList.add('has-medium-question');
        }
        element.tabIndex = 0;
        element.setAttribute('aria-label', `Egg ${index + 1}. Click three times to reveal the question.`);

        const number = document.createElement('span');
        number.className = 'question-number';
        number.textContent = String(index + 1).padStart(2, '0');

        const text = document.createElement('span');
        text.className = 'question-text';
        text.textContent = question;

        const cracks = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        cracks.classList.add('egg-cracks');
        cracks.setAttribute('viewBox', '0 0 100 130');
        cracks.setAttribute('aria-hidden', 'true');
        cracks.innerHTML = `
            <path class="crack-line crack-line-one" d="M50 0 L47 22 L53 38 L48 56 L54 72" />
            <path class="crack-line crack-line-two" d="M48 56 L35 50 L23 56 L0 52 M54 72 L38 78 L24 73 L0 86" />
            <path class="crack-line crack-line-three" d="M53 38 L66 32 L79 39 L100 34 M54 72 L69 82 L82 78 L100 91 M54 72 L50 91 L57 106 L53 130" />
        `;

        element.append(number, text, cracks);
        stage.appendChild(element);

        const body = {
            element,
            number,
            text,
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            vx: 0,
            vy: 0,
            angle: 0,
            angularVelocity: 0,
            rotationPaused: false,
            dragging: false,
            cracks: 0,
            broken: false,
            index
        };
        bodies.push(body);
        updateBodySize(body);

        element.addEventListener('pointerdown', (event) => startDrag(event, body));
        element.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                breakEgg(body);
                return;
            }
            const impulses = { ArrowLeft: [-1.8, 0], ArrowRight: [1.8, 0], ArrowUp: [0, -1.8], ArrowDown: [0, 1.8] };
            if (!impulses[event.key]) return;
            event.preventDefault();
            [body.vx, body.vy] = impulses[event.key];
        });
    });
}

function buildWall() {
    refreshBounds();
    bodies.forEach(updateBodySize);

    const eggHeight = Math.max(...bodies.map((body) => body.h));
    const stackSpacing = eggHeight;
    const topSpace = 0;
    const bottomSpace = 0;
    const longCanvasHeight = Math.max(
        window.innerHeight * 1.8,
        topSpace + stackSpacing * (bodies.length - 1) + eggHeight + bottomSpace
    );
    stage.style.height = `${longCanvasHeight}px`;
    refreshBounds();

    const startingAngles = [-4, 3, -2, 5, -3, 2, 4, -5, 3, -2];
    bodies.forEach((body, index) => {
        body.x = (stageWidth - body.w) / 2;
        body.y = topSpace + index * stackSpacing;
        body.vx = 0;
        body.vy = 0;
        body.angle = startingAngles[(index * 7) % startingAngles.length];
        body.angularVelocity = 0;
    });
    render();
}

function startDrag(event, body) {
    const rect = stage.getBoundingClientRect();
    const motionOffset = getMotionOffset(body);
    activeBody = body;

    // Freeze the egg on pointer-down instead of waiting for the drag
    // threshold. Baking the current sensor offset into its physical position
    // keeps the egg exactly under the finger when it leaves the moving stack.
    body.x += motionOffset.x;
    body.y += motionOffset.y;
    body.dragging = true;
    body.vx = 0;
    body.vy = 0;
    body.angularVelocity = 0;
    pointerOffset.x = event.clientX - rect.left - body.x;
    pointerOffset.y = event.clientY - rect.top - body.y;
    pointerStart = { x: event.clientX, y: event.clientY };
    dragMoved = false;
    previousPointer = { x: event.clientX, y: event.clientY, time: performance.now() };
    body.element.setPointerCapture(event.pointerId);
    event.preventDefault();
}

function moveDrag(event) {
    if (!activeBody) return;
    event.preventDefault();
    if (!dragMoved && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 6) {
        dragMoved = true;
        activeBody.rotationPaused = false;
        activeBody.element.classList.add('is-dragging');
    }
    if (!dragMoved) return;

    const rect = stage.getBoundingClientRect();
    const now = performance.now();
    const elapsed = Math.max(8, now - previousPointer.time);
    activeBody.x = Math.max(0, Math.min(stageWidth - activeBody.w, event.clientX - rect.left - pointerOffset.x));
    activeBody.y = Math.max(0, Math.min(stageHeight - activeBody.h, event.clientY - rect.top - pointerOffset.y));
    activeBody.vx = (event.clientX - previousPointer.x) / elapsed * 11;
    activeBody.vy = (event.clientY - previousPointer.y) / elapsed * 11;
    activeBody.angularVelocity = (
        (event.clientX - previousPointer.x) + (event.clientY - previousPointer.y) * 0.35
    ) / elapsed * 0.75;
    previousPointer = { x: event.clientX, y: event.clientY, time: now };
}

function endDrag() {
    if (!activeBody) return;
    const releasedBody = activeBody;
    if (!releasedBody.broken) {
        const motionOffset = getStackMotionOffset();
        releasedBody.x -= motionOffset.x;
        releasedBody.y -= motionOffset.y;
    }
    activeBody.dragging = false;
    activeBody.element.classList.remove('is-dragging');
    activeBody = null;
    if (!dragMoved) {
        breakEgg(releasedBody);
        return;
    }

    bodies.forEach((body) => {
        if (body === releasedBody || body.y >= releasedBody.y) return;
        const direction = body.index % 2 ? 1 : -1;
        body.vx += direction * (0.55 + (body.index % 4) * 0.12);
        body.angularVelocity += direction * 0.12;
    });
}

function resolvePair(a, b) {
    // A cracked-open egg becomes a stationary question outline. It no longer
    // supports the intact eggs above it, so only deliberate breaking can make
    // the tower settle or collapse.
    if (a.broken || b.broken || (a.dragging && b.dragging)) return;
    const dx = (b.x + b.w / 2) - (a.x + a.w / 2);
    const dy = (b.y + b.h / 2) - (a.y + a.h / 2);
    const combinedRadiusX = (a.w + b.w) * 0.47;
    const combinedRadiusY = (a.h + b.h) * 0.5;
    const scaledX = dx / combinedRadiusX;
    const scaledY = dy / combinedRadiusY;
    const scaledDistance = Math.hypot(scaledX, scaledY);
    if (scaledDistance >= 1) return;

    let normalX = dx / (combinedRadiusX * combinedRadiusX);
    let normalY = dy / (combinedRadiusY * combinedRadiusY);
    const normalLength = Math.hypot(normalX, normalY) || 1;
    normalX /= normalLength;
    normalY /= normalLength;

    const aOnFloor = a.y + a.h >= stageHeight - 0.75;
    const bOnFloor = b.y + b.h >= stageHeight - 0.75;
    const aIsVerticalSupport = aOnFloor && normalY < -0.35;
    const bIsVerticalSupport = bOnFloor && normalY > 0.35;
    const inverseA = a.dragging || aIsVerticalSupport ? 0 : 1;
    const inverseB = b.dragging || bIsVerticalSupport ? 0 : 1;
    const inverseTotal = inverseA + inverseB || 1;
    const penetration = (1 - scaledDistance) * Math.min(combinedRadiusX, combinedRadiusY);

    if (!a.dragging) {
        a.x -= normalX * penetration * (inverseA / inverseTotal);
        a.y -= normalY * penetration * (inverseA / inverseTotal);
    }
    if (!b.dragging) {
        b.x += normalX * penetration * (inverseB / inverseTotal);
        b.y += normalY * penetration * (inverseB / inverseTotal);
    }

    const relativeVelocity = (b.vx - a.vx) * normalX + (b.vy - a.vy) * normalY;
    if (relativeVelocity < 0) {
        const impulse = -(1.08 * relativeVelocity) / inverseTotal;
        if (inverseA) {
            a.vx -= impulse * normalX;
            a.vy -= impulse * normalY;
        }
        if (inverseB) {
            b.vx += impulse * normalX;
            b.vy += impulse * normalY;
        }
    }

    // Collisions only move the eggs; they do not keep injecting spin.
    // Rotation now comes from dragging or the initial collapse impulse and
    // naturally reaches zero through the damping in tick().
}

function keepInside(body) {
    const bounce = 0.18;
    if (body.x < 0) {
        body.x = 0;
        body.vx = Math.abs(body.vx) * bounce;
    } else if (body.x + body.w > stageWidth) {
        body.x = stageWidth - body.w;
        body.vx = -Math.abs(body.vx) * bounce;
    }
    if (body.y < 0) {
        body.y = 0;
        body.vy = Math.abs(body.vy) * bounce;
    } else if (body.y + body.h > stageHeight) {
        body.y = stageHeight - body.h;
        body.vy = Math.abs(body.vy) < 0.5 ? 0 : -Math.abs(body.vy) * bounce;
        body.vx *= 0.82;
    }
}

function keepEggsInScrollableView() {
    scrollGuardFrame = 0;
    if (!bodies.length || activeBody) return;

    const highestEggY = Math.min(...bodies.map((body) => body.y));
    const maximumEmptySpace = window.innerHeight * 0.72;
    const minimumScrollY = Math.max(0, stage.offsetTop + highestEggY - maximumEmptySpace);

    if (window.scrollY < minimumScrollY - 1) {
        window.scrollTo(0, minimumScrollY);
    }
}

function scheduleScrollGuard() {
    if (scrollGuardFrame) return;
    scrollGuardFrame = requestAnimationFrame(keepEggsInScrollableView);
}

function getStackMotionOffset() {
    return {
        x: motionEnabled ? tiltX * 6 + shakeX * 0.8 : 0,
        y: motionEnabled ? tiltY * 2 + shakeY * 0.35 : 0
    };
}

function getMotionOffset(body) {
    if (body.broken || body.dragging) return { x: 0, y: 0 };
    return getStackMotionOffset();
}

function render() {
    // Motion is a restrained visual response shared by the entire intact
    // stack. Applying the same offset to every egg preserves its structure.
    bodies.forEach((body) => {
        const motionOffset = getMotionOffset(body);
        body.element.style.transform = `translate3d(${(body.x + motionOffset.x).toFixed(2)}px, ${(body.y + motionOffset.y).toFixed(2)}px, 0) rotate(${body.angle.toFixed(2)}deg)`;
    });
}

function tick(now) {
    const dt = Math.min(2, (now - lastTime) / 16.667 || 1);
    lastTime = now;

    if (!reducedMotion) {
        bodies.forEach((body) => {
            if (body.dragging || body.broken) return;
            body.vy += 0.38 * dt;
            body.x += body.vx * dt;
            body.y += body.vy * dt;
            if (body.rotationPaused) {
                body.angularVelocity = 0;
            } else {
                body.angle += body.angularVelocity * dt;
            }
            body.vx *= 0.992;
            body.vy *= 0.992;
            body.angularVelocity *= 0.88;
            if (Math.abs(body.angularVelocity) < 0.012) body.angularVelocity = 0;
            keepInside(body);
        });

        for (let pass = 0; pass < 20; pass += 1) {
            for (let index = 0; index < bodies.length; index += 1) {
                for (let other = index + 1; other < bodies.length; other += 1) {
                    resolvePair(bodies[index], bodies[other]);
                }
            }
        }
        bodies.forEach(keepInside);

        shakeX *= 0.84;
        shakeY *= 0.84;
    }

    render();
    requestAnimationFrame(tick);
}

window.addEventListener('pointermove', moveDrag);
window.addEventListener('pointerup', endDrag);
window.addEventListener('pointercancel', endDrag);
window.addEventListener('scroll', scheduleScrollGuard, { passive: true });
window.addEventListener('resize', () => {
    buildWall();
});
refreshBounds();
createBodies();
buildWall();
requestAnimationFrame(() => {
    requestAnimationFrame(() => window.scrollTo(0, document.documentElement.scrollHeight));
});
requestAnimationFrame(tick);
