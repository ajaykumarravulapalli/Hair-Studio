require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'hairstudio';
const JWT_SECRET = process.env.JWT_SECRET || 'hairstudio_jwt_secret_key_2026';
const DB_FILE = path.join(__dirname, 'db.json');

let dbClient = null;
let mongoDB = null;

// Read db.json fallback / seed template
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'ajayravulapalli.555@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AJay@09082005';

function readLocalSeed() {
    try {
        if (fs.existsSync(DB_FILE)) {
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        }
    } catch (e) {
        console.error('Error reading db.json:', e);
    }
    return null;
}

let dbPromise = null;
// Connect to MongoDB Atlas & Initialize Collections
async function initMongoDB() {
    if (mongoDB) return mongoDB;
    if (dbPromise) return dbPromise;
    if (!MONGODB_URI) {
        console.warn('MONGODB_URI not provided in .env');
        return null;
    }
    dbPromise = (async () => {
        try {
            console.log('Connecting to MongoDB Atlas...');
            dbClient = new MongoClient(MONGODB_URI);
            await dbClient.connect();
            mongoDB = dbClient.db(DB_NAME);
            console.log(`Connected successfully to MongoDB Atlas database: ${DB_NAME}`);

        // Create unique index on users.email
        await mongoDB.collection('users').createIndex({ email: 1 }, { unique: true });

        // Ensure ONLY ajayravulapalli.555@gmail.com is configured as Admin
        await mongoDB.collection('users').deleteMany({ role: 'admin', email: { $ne: ADMIN_EMAIL } });

        const adminHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
        await mongoDB.collection('users').updateOne(
            { email: ADMIN_EMAIL },
            {
                $set: {
                    name: 'Ajay (Administrator)',
                    email: ADMIN_EMAIL,
                    password: adminHash,
                    phone: '+91 98765 00000',
                    role: 'admin',
                    updatedAt: new Date()
                },
                $setOnInsert: {
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );
        console.log(`Configured exclusive Admin account: ${ADMIN_EMAIL}`);

        // Seed default Customer if not present
        const customerPasswordHash = bcrypt.hashSync('password123', 10);
        await mongoDB.collection('users').updateOne(
            { email: 'rahul@gmail.com' },
            {
                $setOnInsert: {
                    name: 'Rahul Sharma',
                    email: 'rahul@gmail.com',
                    password: customerPasswordHash,
                    phone: '9876500001',
                    role: 'customer',
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );

        // Seed data if collections are empty
        const seed = readLocalSeed();
        if (seed) {
            // Seed Services
            const servicesCount = await mongoDB.collection('services').countDocuments();
            if (servicesCount === 0 && seed.services && seed.services.length > 0) {
                await mongoDB.collection('services').insertMany(seed.services);
                console.log('Seeded services into MongoDB Atlas.');
            }

            // Seed Stylists
            const stylistsCount = await mongoDB.collection('stylists').countDocuments();
            if (stylistsCount === 0 && seed.stylists && seed.stylists.length > 0) {
                await mongoDB.collection('stylists').insertMany(seed.stylists);
                console.log('Seeded stylists into MongoDB Atlas.');
            }

            // Seed Appointments
            const apptsCount = await mongoDB.collection('appointments').countDocuments();
            if (apptsCount === 0 && seed.appointments && seed.appointments.length > 0) {
                await mongoDB.collection('appointments').insertMany(seed.appointments);
                console.log('Seeded appointments into MongoDB Atlas.');
            }

            // Seed Coupons
            const couponsCount = await mongoDB.collection('coupons').countDocuments();
            if (couponsCount === 0 && seed.coupons && seed.coupons.length > 0) {
                await mongoDB.collection('coupons').insertMany(seed.coupons);
                console.log('Seeded coupons into MongoDB Atlas.');
            }

            // Seed Reviews (genuine reviews only)
            const reviewsCount = await mongoDB.collection('reviews').countDocuments();
            if (reviewsCount === 0 && seed.reviews && seed.reviews.length > 0) {
                await mongoDB.collection('reviews').insertMany(seed.reviews);
                console.log('Seeded reviews into MongoDB Atlas.');
            }

            // Seed Gallery
            const galleryCount = await mongoDB.collection('gallery').countDocuments();
            if (galleryCount === 0 && seed.gallery && seed.gallery.length > 0) {
                await mongoDB.collection('gallery').insertMany(seed.gallery);
                console.log('Seeded gallery into MongoDB Atlas.');
            }
        }
        return mongoDB;
    } catch (err) {
            console.error('MongoDB Atlas Connection Error:', err.message);
            dbPromise = null;
            return null;
        }
    })();
    return dbPromise;
}

// Helper to parse JSON body
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            if (!body) return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

// Helper: Extract & Verify JWT from Authorization header
function verifyToken(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    try {
        return jwt.verify(parts[1], JWT_SECRET);
    } catch (err) {
        return null;
    }
}

// Helper: Create persistent Notification in MongoDB Atlas
async function createNotification({ targetRole = 'all', targetEmail = null, type = 'info', title, message, appointmentId = null, metadata = {} }) {
    if (!mongoDB) return null;
    try {
        const notif = {
            id: `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            targetRole, // 'admin', 'customer', or 'all'
            targetEmail: targetEmail ? targetEmail.toLowerCase() : null,
            type, // 'booking', 'confirmed', 'rescheduled', 'cancelled', 'completed', 'info'
            title,
            message,
            appointmentId,
            metadata,
            read: false,
            createdAt: new Date().toISOString()
        };
        await mongoDB.collection('notifications').insertOne(notif);
        return notif;
    } catch (e) {
        console.warn('Failed to insert notification into Atlas:', e.message);
        return null;
    }
}

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

async function handleRequest(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // ==========================================================
    // REST API ROUTES
    // ==========================================================
    if (pathname.startsWith('/api/')) {
        if (!mongoDB && MONGODB_URI) {
            await initMongoDB();
        }
        if (!mongoDB) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database service connecting to MongoDB Atlas. Please ensure MONGODB_URI is configured.' }));
            return;
        }

        // ------------------------------------------------------
        // 1. AUTHENTICATION APIS
        // ------------------------------------------------------
        // POST /api/auth/register (Customer Registration)
        if (pathname === '/api/auth/register' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { name, email, phone, password } = body;

                if (!name || !email || !password) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Please enter all required fields.' }));
                    return;
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Please enter a valid email address.' }));
                    return;
                }

                if (password.length < 6) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Password must be at least 6 characters long.' }));
                    return;
                }

                const normalizedEmail = email.trim().toLowerCase();
                const existingUser = await mongoDB.collection('users').findOne({ email: normalizedEmail });
                if (existingUser) {
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'An account with this email already exists.' }));
                    return;
                }

                const hashedPassword = bcrypt.hashSync(password, 10);
                const newUser = {
                    name: name.trim(),
                    email: normalizedEmail,
                    phone: (phone || '').trim(),
                    password: hashedPassword,
                    role: 'customer',
                    createdAt: new Date()
                };

                const insertResult = await mongoDB.collection('users').insertOne(newUser);
                const token = jwt.sign(
                    { id: insertResult.insertedId, email: newUser.email, role: newUser.role, name: newUser.name },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    token,
                    user: { name: newUser.name, email: newUser.email, phone: newUser.phone, role: newUser.role }
                }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Registration failed. Please try again.' }));
            }
            return;
        }

        // POST /api/auth/login (Customer Sign In or Admin Login)
        if (pathname === '/api/auth/login' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const { email, password, requestedRole } = body;

                if (!email || !password) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Please enter both email and password.' }));
                    return;
                }

                const normalizedEmail = email.trim().toLowerCase();
                const user = await mongoDB.collection('users').findOne({ email: normalizedEmail });

                if (!user || !bcrypt.compareSync(password, user.password)) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid email or password.' }));
                    return;
                }

                // If user is attempting to log in as Admin, verify role and exact designated admin email
                if (requestedRole === 'admin') {
                    if (user.role !== 'admin' || normalizedEmail !== ADMIN_EMAIL) {
                        res.writeHead(403, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Admin access required. Only the authorized administrator account can access this portal.' }));
                        return;
                    }
                }

                const token = jwt.sign(
                    { id: user._id, email: user.email, role: user.role, name: user.name },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    token,
                    user: { name: user.name, email: user.email, phone: user.phone || '', role: user.role }
                }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Login failed. Please check your connection.' }));
            }
            return;
        }

        // GET /api/auth/me (Restore session from valid JWT)
        if (pathname === '/api/auth/me' && req.method === 'GET') {
            const authUser = verifyToken(req);
            if (!authUser) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not authenticated or session expired.' }));
                return;
            }

            try {
                const user = await mongoDB.collection('users').findOne({ email: authUser.email }, { projection: { password: 0 } });
                if (!user) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User account not found.' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    user: { name: user.name, email: user.email, phone: user.phone || '', role: user.role }
                }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to retrieve profile.' }));
            }
            return;
        }

        // ------------------------------------------------------
        // 2. APPOINTMENTS API (ROLE-BASED AUTHORIZATION)
        // ------------------------------------------------------
        // GET /api/appointments
        if (pathname === '/api/appointments' && req.method === 'GET') {
            const authUser = verifyToken(req);
            if (!authUser) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Authentication required to view appointments.' }));
                return;
            }

            try {
                let query = {};
                if (authUser.role !== 'admin') {
                    // Customers can ONLY see their own appointments
                    query = { customerEmail: { $regex: new RegExp(`^${authUser.email}$`, 'i') } };
                }
                const appts = await mongoDB.collection('appointments').find(query).sort({ date: -1, time: -1 }).toArray();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(appts));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to fetch appointments.' }));
            }
            return;
        }

        // POST /api/appointments
        if (pathname === '/api/appointments' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const randSuffix = Math.floor(1000 + Math.random() * 9000);
                const newAppt = {
                    id: body.id || `HS-${randSuffix}`,
                    customerName: body.customerName,
                    customerEmail: body.customerEmail,
                    customerPhone: body.customerPhone,
                    serviceId: Number(body.serviceId),
                    serviceName: body.serviceName,
                    stylistId: Number(body.stylistId),
                    stylistName: body.stylistName,
                    date: body.date,
                    time: body.time,
                    duration: Number(body.duration) || 30,
                    amount: Number(body.amount) || 0,
                    discount: Number(body.discount) || 0,
                    coupon: body.coupon || '',
                    status: body.status || 'Confirmed',
                    notes: body.notes || '',
                    createdAt: new Date().toISOString()
                };

                await mongoDB.collection('appointments').insertOne(newAppt);

                // Send instant notifications for new booking
                await createNotification({
                    targetRole: 'admin',
                    type: 'booking',
                    title: `📅 New Booking #${newAppt.id}`,
                    message: `Client ${newAppt.customerName} booked ${newAppt.serviceName} with ${newAppt.stylistName} on ${newAppt.date} at ${newAppt.time}.`,
                    appointmentId: newAppt.id,
                    metadata: { customerName: newAppt.customerName, serviceName: newAppt.serviceName, date: newAppt.date, time: newAppt.time, stylistName: newAppt.stylistName }
                });

                if (newAppt.customerEmail) {
                    await createNotification({
                        targetRole: 'customer',
                        targetEmail: newAppt.customerEmail,
                        type: 'booking',
                        title: `Booking Received #${newAppt.id}`,
                        message: `Your appointment for ${newAppt.serviceName} on ${newAppt.date} at ${newAppt.time} has been placed.`,
                        appointmentId: newAppt.id,
                        metadata: { date: newAppt.date, time: newAppt.time, stylistName: newAppt.stylistName }
                    });
                }

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newAppt));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to book appointment' }));
            }
            return;
        }

        // PUT /api/appointments/:id
        const apptMatch = pathname.match(/^\/api\/appointments\/([\w\-]+)$/);
        if (apptMatch && req.method === 'PUT') {
            const authUser = verifyToken(req);

            try {
                const id = apptMatch[1];
                const body = await parseBody(req);
                const existingAppt = await mongoDB.collection('appointments').findOne({ id });

                if (!existingAppt) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Appointment not found.' }));
                    return;
                }

                // Verify authorization
                if (authUser) {
                    if (authUser.role !== 'admin') {
                        if (existingAppt.customerEmail.toLowerCase() !== authUser.email.toLowerCase()) {
                            res.writeHead(403, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Unauthorized to modify another customer appointment.' }));
                            return;
                        }
                    }
                } else {
                    // Guest client: verify email matches appointment
                    const clientEmail = (body.customerEmail || '').trim().toLowerCase();
                    if (!clientEmail || clientEmail !== existingAppt.customerEmail.toLowerCase()) {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Authentication required to update this appointment.' }));
                        return;
                    }
                }

                let slotChanged = false;
                let newDateVal = existingAppt.date;
                let newTimeVal = existingAppt.time;

                // Check slot conflict if date or time is being updated
                if ((body.date || body.time) && body.status !== 'Cancelled') {
                    const targetDate = body.date || existingAppt.date;
                    const targetTime = body.time || existingAppt.time;
                    const targetStylistId = body.stylistId !== undefined ? Number(body.stylistId) : existingAppt.stylistId;

                    if (targetDate !== existingAppt.date || targetTime !== existingAppt.time) {
                        slotChanged = true;
                        newDateVal = targetDate;
                        newTimeVal = targetTime;
                    }

                    const conflict = await mongoDB.collection('appointments').findOne({
                        id: { $ne: id },
                        stylistId: targetStylistId,
                        date: targetDate,
                        time: targetTime,
                        status: { $in: ['Confirmed', 'Pending'] }
                    });

                    if (conflict) {
                        res.writeHead(409, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: `The time slot ${targetTime} on ${targetDate} is already booked for this stylist. Please select another slot.` }));
                        return;
                    }

                    // If a non-admin client updates slot time after confirmation,
                    // reset status to 'Pending' so the Admin can review and re-confirm the new slot time!
                    const isAdmin = authUser && authUser.role === 'admin';
                    if (!isAdmin && slotChanged) {
                        body.status = 'Pending';
                        body.rescheduled = true;
                        body.rescheduledAt = new Date().toISOString();
                        body.notes = (existingAppt.notes ? existingAppt.notes + ' | ' : '') + `Rescheduled from ${existingAppt.date} ${existingAppt.time} to ${targetDate} ${targetTime} (Pending admin confirmation)`;
                    }
                }

                delete body._id;
                delete body.id;

                await mongoDB.collection('appointments').updateOne({ id }, { $set: body });
                const updated = await mongoDB.collection('appointments').findOne({ id });

                // NOTIFICATION TRIGGERS
                // 1. Reschedule event
                if (slotChanged) {
                    await createNotification({
                        targetRole: 'admin',
                        type: 'rescheduled',
                        title: `⚠️ Slot Rescheduled: #${id}`,
                        message: `Client ${existingAppt.customerName} updated slot for #${id} from ${existingAppt.date} ${existingAppt.time} to ${newDateVal} at ${newTimeVal}. Status is Pending admin confirmation.`,
                        appointmentId: id,
                        metadata: {
                            customerName: existingAppt.customerName,
                            serviceName: existingAppt.serviceName,
                            oldDate: existingAppt.date,
                            oldTime: existingAppt.time,
                            newDate: newDateVal,
                            newTime: newTimeVal,
                            stylistName: existingAppt.stylistName
                        }
                    });

                    if (existingAppt.customerEmail) {
                        await createNotification({
                            targetRole: 'customer',
                            targetEmail: existingAppt.customerEmail,
                            type: 'rescheduled',
                            title: `Slot Rescheduled #${id}`,
                            message: `Your appointment #${id} slot has been changed to ${newDateVal} at ${newTimeVal}. Waiting for admin confirmation.`,
                            appointmentId: id,
                            metadata: { newDate: newDateVal, newTime: newTimeVal }
                        });
                    }
                }

                // 2. Confirmation event
                if (body.status === 'Confirmed' && existingAppt.status !== 'Confirmed') {
                    if (existingAppt.customerEmail) {
                        await createNotification({
                            targetRole: 'customer',
                            targetEmail: existingAppt.customerEmail,
                            type: 'confirmed',
                            title: `✅ Appointment Confirmed #${id}`,
                            message: `Your appointment for ${updated.serviceName} on ${updated.date} at ${updated.time} with ${updated.stylistName} has been confirmed!`,
                            appointmentId: id,
                            metadata: { date: updated.date, time: updated.time, stylistName: updated.stylistName }
                        });
                    }
                    await createNotification({
                        targetRole: 'admin',
                        type: 'confirmed',
                        title: `Confirmed #${id}`,
                        message: `Appointment #${id} for ${existingAppt.customerName} on ${updated.date} at ${updated.time} is now confirmed.`,
                        appointmentId: id
                    });
                }

                // 3. Cancellation event
                if (body.status === 'Cancelled' && existingAppt.status !== 'Cancelled') {
                    if (existingAppt.customerEmail) {
                        await createNotification({
                            targetRole: 'customer',
                            targetEmail: existingAppt.customerEmail,
                            type: 'cancelled',
                            title: `❌ Appointment Cancelled #${id}`,
                            message: `Appointment #${id} for ${existingAppt.serviceName} on ${existingAppt.date} at ${existingAppt.time} has been cancelled.`,
                            appointmentId: id
                        });
                    }
                    await createNotification({
                        targetRole: 'admin',
                        type: 'cancelled',
                        title: `Appointment #${id} Cancelled`,
                        message: `Appointment #${id} for ${existingAppt.customerName} was cancelled.`,
                        appointmentId: id
                    });
                }

                // 4. Completed event
                if (body.status === 'Completed' && existingAppt.status !== 'Completed') {
                    if (existingAppt.customerEmail) {
                        await createNotification({
                            targetRole: 'customer',
                            targetEmail: existingAppt.customerEmail,
                            type: 'completed',
                            title: `✨ Visit Completed #${id}`,
                            message: `Thank you for visiting Hair Studio! You can now write a review for your visit.`,
                            appointmentId: id
                        });
                    }
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(updated));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to update appointment' }));
            }
            return;
        }

        // DELETE /api/appointments/:id (Admin only)
        if (apptMatch && req.method === 'DELETE') {
            const authUser = verifyToken(req);
            if (!authUser || authUser.role !== 'admin') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Admin permission required to delete appointments.' }));
                return;
            }

            const id = apptMatch[1];
            await mongoDB.collection('appointments').deleteOne({ id });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, id }));
            return;
        }

        // ------------------------------------------------------
        // 3. SERVICES API (READ: PUBLIC, WRITE: ADMIN ONLY)
        // ------------------------------------------------------
        if (pathname === '/api/services' && req.method === 'GET') {
            const services = await mongoDB.collection('services').find({}).sort({ id: 1 }).toArray();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(services));
            return;
        }

        if (pathname === '/api/services' && req.method === 'POST') {
            const authUser = verifyToken(req);
            if (!authUser || authUser.role !== 'admin') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Admin permission required.' }));
                return;
            }
            try {
                const body = await parseBody(req);
                const all = await mongoDB.collection('services').find({}).toArray();
                const newId = all.length > 0 ? Math.max(...all.map(s => Number(s.id) || 0)) + 1 : 1;
                const newService = {
                    id: newId,
                    name: body.name || 'New Service',
                    category: body.category || 'General',
                    price: Number(body.price) || 0,
                    duration: Number(body.duration) || 30,
                    image: body.image || 'service_haircut.jpg',
                    description: body.description || ''
                };
                await mongoDB.collection('services').insertOne(newService);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newService));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid service data' }));
            }
            return;
        }

        const serviceMatch = pathname.match(/^\/api\/services\/(\d+)$/);
        if (serviceMatch && req.method === 'PUT') {
            const authUser = verifyToken(req);
            if (!authUser || authUser.role !== 'admin') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Admin permission required.' }));
                return;
            }
            try {
                const id = Number(serviceMatch[1]);
                const body = await parseBody(req);
                delete body._id;
                delete body.id;
                await mongoDB.collection('services').updateOne({ id }, { $set: body });
                const updated = await mongoDB.collection('services').findOne({ id });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(updated));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to update service' }));
            }
            return;
        }

        if (serviceMatch && req.method === 'DELETE') {
            const authUser = verifyToken(req);
            if (!authUser || authUser.role !== 'admin') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Admin permission required.' }));
                return;
            }
            const id = Number(serviceMatch[1]);
            await mongoDB.collection('services').deleteOne({ id });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, id }));
            return;
        }

        // ------------------------------------------------------
        // 4. STYLISTS API (READ: PUBLIC, WRITE: ADMIN ONLY)
        // ------------------------------------------------------
        if (pathname === '/api/stylists' && req.method === 'GET') {
            const stylists = await mongoDB.collection('stylists').find({}).sort({ id: 1 }).toArray();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(stylists));
            return;
        }

        if (pathname === '/api/stylists' && req.method === 'POST') {
            const authUser = verifyToken(req);
            if (!authUser || authUser.role !== 'admin') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Admin permission required.' }));
                return;
            }
            try {
                const body = await parseBody(req);
                const all = await mongoDB.collection('stylists').find({}).toArray();
                const newId = all.length > 0 ? Math.max(...all.map(s => Number(s.id) || 0)) + 1 : 1;
                const newStylist = {
                    id: newId,
                    name: body.name || 'New Stylist',
                    image: body.image || 'stylist_crishna.jpg',
                    specialization: body.specialization || 'Hair Specialist',
                    experience: body.experience || '3 Years',
                    rating: Number(body.rating) || 4.8,
                    reviewsCount: 1,
                    availability: body.availability || 'Available Today',
                    phone: body.phone || '+91 98765 00000'
                };
                await mongoDB.collection('stylists').insertOne(newStylist);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newStylist));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid stylist payload' }));
            }
            return;
        }

        const stylistMatch = pathname.match(/^\/api\/stylists\/(\d+)$/);
        if (stylistMatch && req.method === 'PUT') {
            const authUser = verifyToken(req);
            if (!authUser || authUser.role !== 'admin') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Admin permission required.' }));
                return;
            }
            try {
                const id = Number(stylistMatch[1]);
                const body = await parseBody(req);
                delete body._id;
                delete body.id;
                await mongoDB.collection('stylists').updateOne({ id }, { $set: body });
                const updated = await mongoDB.collection('stylists').findOne({ id });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(updated));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to update stylist' }));
            }
            return;
        }

        if (stylistMatch && req.method === 'DELETE') {
            const authUser = verifyToken(req);
            if (!authUser || authUser.role !== 'admin') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Admin permission required.' }));
                return;
            }
            const id = Number(stylistMatch[1]);
            await mongoDB.collection('stylists').deleteOne({ id });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, id }));
            return;
        }

        // ------------------------------------------------------
        // 5. REVIEWS API
        // ------------------------------------------------------
        if (pathname === '/api/reviews' && req.method === 'GET') {
            const reviews = await mongoDB.collection('reviews').find({}).sort({ id: 1 }).toArray();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(reviews));
            return;
        }

        if (pathname === '/api/reviews' && req.method === 'POST') {
            try {
                const body = await parseBody(req);
                const all = await mongoDB.collection('reviews').find({}).toArray();
                const newRev = {
                    id: all.length + 1,
                    name: body.name || 'Verified Client',
                    handle: body.handle || `@client${Math.floor(100 + Math.random()*900)}`,
                    image: body.image || 'dhoni.jpg',
                    rating: Number(body.rating) || 5,
                    text: body.text,
                    serviceName: body.serviceName || 'Hair Studio Experience',
                    stylistName: body.stylistName || 'Salon Team',
                    date: new Date().toISOString().split('T')[0]
                };
                await mongoDB.collection('reviews').insertOne(newRev);

                if (body.appointmentId) {
                    await mongoDB.collection('appointments').updateOne(
                        { id: body.appointmentId },
                        { $set: { reviewed: true } }
                    );
                }

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newRev));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to add review' }));
            }
            return;
        }

        const reviewMatch = pathname.match(/^\/api\/reviews\/(\d+)$/);
        if (reviewMatch && req.method === 'DELETE') {
            const authUser = verifyToken(req);
            if (!authUser || authUser.role !== 'admin') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Admin permission required.' }));
                return;
            }
            const id = Number(reviewMatch[1]);
            await mongoDB.collection('reviews').deleteOne({ id });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, id }));
            return;
        }

        // ------------------------------------------------------
        // 6. COUPONS & GALLERY APIS
        // ------------------------------------------------------
        if (pathname === '/api/coupons' && req.method === 'GET') {
            const coupons = await mongoDB.collection('coupons').find({}).toArray();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(coupons));
            return;
        }

        if (pathname === '/api/gallery' && req.method === 'GET') {
            const gallery = await mongoDB.collection('gallery').find({}).sort({ id: 1 }).toArray();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(gallery));
            return;
        }

        // ------------------------------------------------------
        // 7. NOTIFICATIONS API
        // ------------------------------------------------------
        // GET /api/notifications
        if (pathname === '/api/notifications' && req.method === 'GET') {
            const authUser = verifyToken(req);
            const emailQuery = (parsedUrl.query && parsedUrl.query.email) ? parsedUrl.query.email.trim().toLowerCase() : null;

            let filter = {};
            if (authUser && authUser.role === 'admin') {
                filter = { $or: [{ targetRole: 'admin' }, { targetRole: 'all' }] };
            } else if (authUser && authUser.role === 'customer') {
                filter = {
                    $or: [
                        { targetEmail: authUser.email.toLowerCase() },
                        { targetRole: 'all' }
                    ]
                };
            } else if (emailQuery) {
                filter = {
                    $or: [
                        { targetEmail: emailQuery },
                        { targetRole: 'all' }
                    ]
                };
            } else {
                filter = { targetRole: 'all' };
            }

            const notifs = await mongoDB.collection('notifications')
                .find(filter)
                .sort({ createdAt: -1 })
                .limit(60)
                .toArray();

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(notifs));
            return;
        }

        // POST or PUT /api/notifications/:id/read
        const notifReadMatch = pathname.match(/^\/api\/notifications\/([\w\-]+)\/read$/);
        if (notifReadMatch && (req.method === 'POST' || req.method === 'PUT')) {
            const id = notifReadMatch[1];
            await mongoDB.collection('notifications').updateOne({ id }, { $set: { read: true } });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, id }));
            return;
        }

        // POST /api/notifications/mark-all-read
        if (pathname === '/api/notifications/mark-all-read' && req.method === 'POST') {
            const authUser = verifyToken(req);
            const body = await parseBody(req);
            const email = (authUser?.email || body.email || '').toLowerCase();

            let filter = {};
            if (authUser && authUser.role === 'admin') {
                filter = { $or: [{ targetRole: 'admin' }, { targetRole: 'all' }] };
            } else if (email) {
                filter = { targetEmail: email };
            } else {
                filter = { targetRole: 'all' };
            }

            await mongoDB.collection('notifications').updateMany(filter, { $set: { read: true } });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // POST /api/notifications/clear (clear read notifications)
        if (pathname === '/api/notifications/clear' && req.method === 'POST') {
            const authUser = verifyToken(req);
            const body = await parseBody(req);
            const email = (authUser?.email || body.email || '').toLowerCase();

            let filter = { read: true };
            if (authUser && authUser.role === 'admin') {
                filter = { $and: [{ read: true }, { $or: [{ targetRole: 'admin' }, { targetRole: 'all' }] }] };
            } else if (email) {
                filter = { $and: [{ read: true }, { targetEmail: email }] };
            }

            await mongoDB.collection('notifications').deleteMany(filter);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
            return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint not found' }));
        return;
    }

    // ==========================================================
    // STATIC ASSETS SERVING
    // ==========================================================
    let filePath = (pathname === '/' || pathname === '/index.html') ? 'index.html' : pathname.replace(/^\//, '');
    filePath = path.join(__dirname, decodeURIComponent(filePath));

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
}

const server = http.createServer(handleRequest);

// Start Server and connect to MongoDB Atlas
if (require.main === module) {
    server.listen(PORT, async () => {
        console.log(`Hair Studio Server running at http://localhost:${PORT}`);
        await initMongoDB();
    });
}

module.exports = server;
module.exports.handleRequest = handleRequest;

