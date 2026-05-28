import { useEffect, useState } from 'react'
import { Link, Routes, Route, useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
    const navigate = useNavigate()

    const [workers, setWorkers] = useState([])
    const [search, setSearch] = useState('')
    const [session, setSession] = useState(null)

    const [authEmail, setAuthEmail] = useState('')
    const [authPassword, setAuthPassword] = useState('')

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        skill: '',
        location: '',
        hourly_rate: ''
    })

    useEffect(() => {
        fetchWorkers()

        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

    async function signUp() {
        try {
            const { error } = await supabase.auth.signUp({
                email: authEmail,
                password: authPassword
            })

            if (error) {
                alert(error.message)
                return
            }

            alert('Signup successful!')
        } catch (err) {
            alert(err.message)
        }
    }

    async function logIn() {
        const { error } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password: authPassword
        })

        if (error) {
            alert(error.message)
        }
    }

    async function logOut() {
        await supabase.auth.signOut()
    }

    async function fetchWorkers() {
        const { data, error } = await supabase
            .from('workers')
            .select('*')
            .order('id', { ascending: false })

        if (error) {
            console.error(error)
            return
        }

        setWorkers(data || [])
    }

    async function addWorker(e, type = 'independent') {
        e.preventDefault()

        if (!session) {
            alert('Duhet të kyçeni fillimisht.')
            return
        }

        const fullName = `${form.first_name} ${form.last_name}`.trim()

        const { data, error } = await supabase
            .from('workers')
            .insert([
                {
                    user_id: session.user.id,
                    profile_type: type,
                    first_name: form.first_name,
                    last_name: form.last_name,
                    full_name: fullName,
                    email: form.email,
                    phone: form.phone,
                    skill: form.skill,
                    location: form.location,
                    hourly_rate: Number(form.hourly_rate),
                    profile_completed: false
                }
            ])
            .select()
            .single()

        if (error) {
            alert(error.message)
            return
        }

        setForm({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            skill: '',
            location: '',
            hourly_rate: ''
        })

        await fetchWorkers()

        if (type === 'independent') {
            navigate(`/workers/${data.id}/edit`)
        } else {
            alert('Punëtori u shtua me sukses.')
        }
    }

    async function deleteWorker(id) {
        const { error } = await supabase
            .from('workers')
            .delete()
            .eq('id', id)

        if (error) {
            alert(error.message)
            return
        }

        fetchWorkers()
    }

    const filteredWorkers = workers.filter(worker =>
        worker.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        worker.skill?.toLowerCase().includes(search.toLowerCase()) ||
        worker.location?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="page">

            <nav className="navbar">
                <Link to="/" className="logo">
                    <img src="/logo.png" alt="Punaflow Logo" className="navbarLogo" />
                </Link>

                <div className="navLinks">
                    <Link to="/">Ballina</Link>
                    <Link to="/workers">Kërko Punëtorë</Link>
                    <Link to="/independent">Punoj i Pavarur</Link>
                    <Link to="/business">Kam Biznes</Link>
                </div>
            </nav>

            <main className="container">

                <Routes>

                    <Route
                        path="/"
                        element={
                            <Home
                                search={search}
                                setSearch={setSearch}
                                filteredWorkers={filteredWorkers}
                            />
                        }
                    />

                    <Route
                        path="/workers"
                        element={
                            <WorkersPage
                                search={search}
                                setSearch={setSearch}
                                filteredWorkers={filteredWorkers}
                            />
                        }
                    />

                    <Route
                        path="/workers/:id"
                        element={<WorkerProfile workers={workers} />}
                    />

                    <Route
                        path="/workers/:id/edit"
                        element={
                            <MiniWebsiteEditor
                                workers={workers}
                                fetchWorkers={fetchWorkers}
                            />
                        }
                    />

                    <Route
                        path="/independent"
                        element={
                            <ProtectedProfilePage
                                title="Punëtor i Pavarur"
                                heading="Krijo Profilin"
                                session={session}
                                authEmail={authEmail}
                                setAuthEmail={setAuthEmail}
                                authPassword={authPassword}
                                setAuthPassword={setAuthPassword}
                                signUp={signUp}
                                logIn={logIn}
                                logOut={logOut}
                            >
                                <WorkerForm
                                    form={form}
                                    setForm={setForm}
                                    addWorker={(e) => addWorker(e, 'independent')}
                                    buttonText="Krijo Profil"
                                />
                            </ProtectedProfilePage>
                        }
                    />

                    <Route
                        path="/business"
                        element={
                            <ProtectedProfilePage
                                title="Biznes"
                                heading="Paneli i Biznesit"
                                session={session}
                                authEmail={authEmail}
                                setAuthEmail={setAuthEmail}
                                authPassword={authPassword}
                                setAuthPassword={setAuthPassword}
                                signUp={signUp}
                                logIn={logIn}
                                logOut={logOut}
                                variant="business"
                            >

                                <WorkerForm
                                    form={form}
                                    setForm={setForm}
                                    addWorker={(e) => addWorker(e, 'business')}
                                    buttonText="Shto Punëtor"
                                />

                                <div className="sectionHeader smallTop">
                                    <h2>Punëtorët në sistem</h2>
                                </div>

                                <WorkerGrid
                                    workers={workers}
                                    deleteWorker={deleteWorker}
                                    showDelete
                                />

                            </ProtectedProfilePage>
                        }
                    />

                </Routes>

            </main>

        </div>
    )
}

function Home({ search, setSearch, filteredWorkers }) {
    const latestWorkers = filteredWorkers.slice(0, 4)

    return (
        <section className="homePage premiumHome">

            <div className="homeHeroNew">

                <div className="heroLeft">

                    <p className="heroBadge">
                        Marketplace për shërbime
                    </p>

                    <h1>
                        Gjej njerëzit e duhur <br />
                        për çdo punë.
                    </h1>

                    <p className="heroText">
                        Punaflow lidh bizneset dhe klientët me profesionistë të verifikuar.
                    </p>

                    <div className="heroSearch">

                        <input
                            placeholder="Kërko..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <button>Kërko</button>

                    </div>

                </div>

            </div>

            <div className="recommendedHeader">
                <h2>Profesionistë të rekomanduar</h2>
            </div>

            <div className="recommendedGrid">

                {latestWorkers.map(worker => (

                    <div className="recommendedCard" key={worker.id}>

                        {worker.logo_url && (
                            <img src={worker.logo_url} alt="" />
                        )}

                        <div>
                            <h3>{worker.full_name}</h3>
                            <p>{worker.skill}</p>

                            <Link to={`/workers/${worker.id}`}>
                                Shiko profilin
                            </Link>
                        </div>

                    </div>

                ))}

            </div>

        </section>
    )
}

function WorkersPage({ search, setSearch, filteredWorkers }) {
    return (
        <section className="workersSection">

            <div className="sectionHeader">
                <p className="eyebrow">Kërko Punëtorë</p>
                <h2>Gjej punëtorin e duhur</h2>
            </div>

            <input
                className="search"
                placeholder="Kërko..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <WorkerGrid workers={filteredWorkers} />

        </section>
    )
}

function ProtectedProfilePage({
    title,
    heading,
    session,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    signUp,
    logIn,
    logOut,
    children
}) {

    if (!session) {
        return (
            <section className="premiumAuthPage">

                <AuthCard
                    title={title}
                    authEmail={authEmail}
                    setAuthEmail={setAuthEmail}
                    authPassword={authPassword}
                    setAuthPassword={setAuthPassword}
                    signUp={signUp}
                    logIn={logIn}
                />

            </section>
        )
    }

    return (
        <section className="adminSection">

            <div className="sectionHeader">

                <p className="eyebrow">{title}</p>

                <h2>{heading}</h2>

                <p>
                    Kyçur si: {session.user.email}
                </p>

                <button onClick={logOut}>
                    Log out
                </button>

            </div>

            {children}

        </section>
    )
}

function AuthCard({
    title,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    signUp,
    logIn
}) {
    return (
        <div className="authCard">

            <p className="eyebrow">{title}</p>

            <h2>Kyçu ose krijo llogari</h2>

            <div className="authInputWrap">

                <input
                    type="email"
                    placeholder="Email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                />

            </div>

            <div className="authInputWrap">

                <input
                    type="password"
                    placeholder="Password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                />

            </div>

            <div className="authActions">

                <button onClick={signUp}>
                    Sign up
                </button>

                <button
                    className="secondaryBtn"
                    onClick={logIn}
                >
                    Log in
                </button>

            </div>

        </div>
    )
}

function WorkerForm({ form, setForm, addWorker, buttonText }) {
    return (
        <form className="workerForm" onSubmit={addWorker}>

            <input
                placeholder="First name"
                value={form.first_name}
                onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                }
            />

            <input
                placeholder="Last name"
                value={form.last_name}
                onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                }
            />

            <input
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                }
            />

            <input
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                }
            />

            <input
                placeholder="Profession"
                value={form.skill}
                onChange={(e) =>
                    setForm({ ...form, skill: e.target.value })
                }
            />

            <input
                placeholder="Location"
                value={form.location}
                onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                }
            />

            <input
                placeholder="Hourly rate"
                value={form.hourly_rate}
                onChange={(e) =>
                    setForm({ ...form, hourly_rate: e.target.value })
                }
            />

            <button type="submit">
                {buttonText}
            </button>

        </form>
    )
}

function WorkerGrid({ workers, deleteWorker, showDelete = false }) {
    return (
        <div className="grid">

            {workers.map(worker => (

                <div className="workerCard" key={worker.id}>

                    <h3>{worker.full_name}</h3>

                    <p>{worker.skill}</p>

                    <p>{worker.location}</p>

                    <p>{worker.hourly_rate} € / orë</p>

                    <Link to={`/workers/${worker.id}`}>
                        Shiko profilin
                    </Link>

                    <Link to={`/workers/${worker.id}/edit`}>
                        Edito mini website
                    </Link>

                    {showDelete && (
                        <button
                            className="deleteBtn"
                            onClick={() => deleteWorker(worker.id)}
                        >
                            Fshije
                        </button>
                    )}

                </div>

            ))}

        </div>
    )
}

function WorkerProfile({ workers }) {

    const { id } = useParams()

    const worker = workers.find(w => String(w.id) === id)

    if (!worker) {
        return <h2>Profili nuk u gjet.</h2>
    }

    return (
        <section className="profilePage">

            <div className="profileHeader">

                <div>

                    <p className="eyebrow">
                        Punaflow Profile
                    </p>

                    <h1>
                        {worker.website_title || worker.full_name}
                    </h1>

                    <p>
                        {worker.skill} · {worker.location}
                    </p>

                </div>

            </div>

            <div className="profileDetails">

                <div>

                    <h2>Rreth profilit</h2>

                    <p>
                        {worker.about || 'Nuk ka përshkrim ende.'}
                    </p>

                </div>

                <div className="profilePrice">

                    <h3>
                        {worker.hourly_rate} € / orë
                    </h3>

                    <p>{worker.email}</p>

                    <p>{worker.phone}</p>

                    <Link
                        to={`/workers/${worker.id}/edit`}
                        className="editProfileBtn"
                    >
                        Edito mini website
                    </Link>

                </div>

            </div>

        </section>
    )
}

function MiniWebsiteEditor({ workers, fetchWorkers }) {

    const { id } = useParams()

    const worker = workers.find(w => String(w.id) === id)

    const [miniSite, setMiniSite] = useState({
        logo_url: '',
        cover_url: '',
        website_title: '',
        about: '',
        service_description: '',
        portfolio_image_1: '',
        portfolio_image_2: '',
        portfolio_image_3: ''
    })

    useEffect(() => {

        if (worker) {
            setMiniSite({
                logo_url: worker.logo_url || '',
                cover_url: worker.cover_url || '',
                website_title: worker.website_title || '',
                about: worker.about || '',
                service_description: worker.service_description || '',
                portfolio_image_1: worker.portfolio_image_1 || '',
                portfolio_image_2: worker.portfolio_image_2 || '',
                portfolio_image_3: worker.portfolio_image_3 || ''
            })
        }

    }, [worker])

    if (!worker) {
        return <h2>Profili nuk u gjet.</h2>
    }

    async function saveMiniSite(e) {

        e.preventDefault()

        const { error } = await supabase
            .from('workers')
            .update({
                ...miniSite,
                profile_completed: true
            })
            .eq('id', worker.id)

        if (error) {
            alert(error.message)
            return
        }

        alert('Mini website u ruajt.')
        fetchWorkers()
    }

    return (
        <section className="miniSiteEditor">

            <div className="sectionHeader">

                <p className="eyebrow">
                    Mini Website
                </p>

                <h2>
                    Edito profilin publik
                </h2>

            </div>

            <form onSubmit={saveMiniSite}>

                <input
                    placeholder="Logo URL"
                    value={miniSite.logo_url}
                    onChange={(e) =>
                        setMiniSite({
                            ...miniSite,
                            logo_url: e.target.value
                        })
                    }
                />

                <input
                    placeholder="Cover image URL"
                    value={miniSite.cover_url}
                    onChange={(e) =>
                        setMiniSite({
                            ...miniSite,
                            cover_url: e.target.value
                        })
                    }
                />

                <input
                    placeholder="Website title"
                    value={miniSite.website_title}
                    onChange={(e) =>
                        setMiniSite({
                            ...miniSite,
                            website_title: e.target.value
                        })
                    }
                />

                <textarea
                    placeholder="About"
                    value={miniSite.about}
                    onChange={(e) =>
                        setMiniSite({
                            ...miniSite,
                            about: e.target.value
                        })
                    }
                />

                <textarea
                    placeholder="Services"
                    value={miniSite.service_description}
                    onChange={(e) =>
                        setMiniSite({
                            ...miniSite,
                            service_description: e.target.value
                        })
                    }
                />

                <button type="submit">
                    Ruaj mini website
                </button>

            </form>

        </section>
    )
}

export default App