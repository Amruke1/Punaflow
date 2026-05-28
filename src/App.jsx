import { useEffect, useState } from 'react'
import { Link, Routes, Route, useParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
    const [workers, setWorkers] = useState([])
    const [search, setSearch] = useState('')
    const [session, setSession] = useState(null)

    const [authEmail, setAuthEmail] = useState('')
    const [authPassword, setAuthPassword] = useState('')

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        skill: '',
        location: '',
        hourly_rate: '',
        logo_url: '',
        about: '',
        portfolio_image_1: '',
        portfolio_image_2: '',
        portfolio_image_3: ''
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
        if (!authEmail || !authPassword) {
            alert('Shkruaj email dhe password.')
            return
        }

        if (authPassword.length < 6) {
            alert('Password duhet të ketë së paku 6 karaktere.')
            return
        }

        const { data, error } = await supabase.auth.signUp({
            email: authEmail,
            password: authPassword
        })

        if (error) {
            alert(error.message)
            return
        }

        alert('Llogaria u krijua. Tani kliko Log in.')
        console.log('Signup data:', data)
    }

    async function logIn() {
        const { error } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password: authPassword
        })

        if (error) alert(error.message)
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

    async function addWorker(e) {
        e.preventDefault()

        if (!session) {
            alert('Duhet të kyçeni fillimisht.')
            return
        }

        const { error } = await supabase.from('workers').insert([
            {
                user_id: session.user.id,
                full_name: form.full_name,
                email: form.email,
                skill: form.skill,
                location: form.location,
                hourly_rate: Number(form.hourly_rate),
                logo_url: form.logo_url,
                about: form.about,
                portfolio_image_1: form.portfolio_image_1,
                portfolio_image_2: form.portfolio_image_2,
                portfolio_image_3: form.portfolio_image_3
            }
        ])

        if (error) {
            alert(error.message)
            return
        }

        setForm({
            full_name: '',
            email: '',
            skill: '',
            location: '',
            hourly_rate: '',
            logo_url: '',
            about: '',
            portfolio_image_1: '',
            portfolio_image_2: '',
            portfolio_image_3: ''
        })

        fetchWorkers()
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
                    <Route path="/workers/:id" element={<WorkerProfile workers={workers} />} />
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
                        path="/independent"
                        element={
                            <ProtectedProfilePage
                                title="Punëtor i Pavarur"
                                heading="Krijo Profilin"
                                description="Krijo profilin dhe portfolio-n tënde."
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
                                    addWorker={addWorker}
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
                                description="Menaxho profilin dhe punëtorët."
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
                                    addWorker={addWorker}
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

            <footer className="footer">
                <div className="footerTop">
                    <img src="/logo.png" alt="Punaflow Logo" className="footerLogo" />

                    <p>
                        Punaflow lidh punëtorët, bizneset dhe klientët
                        në një platformë moderne dhe të thjeshtë.
                    </p>
                </div>

                <div className="footerLinks">
                    <div>
                        <h4>Platforma</h4>
                        <a href="/">Ballina</a>
                        <a href="/workers">Kërko Punëtorë</a>
                    </div>

                    <div>
                        <h4>Llogaritë</h4>
                        <a href="/independent">Punoj i Pavarur</a>
                        <a href="/business">Kam Biznes</a>
                    </div>

                    <div>
                        <h4>Kontakt</h4>
                        <p>support@punaflow.com</p>
                        <p>Kosovë</p>
                    </div>
                </div>

                <div className="footerBottom">
                    © 2026 Punaflow. All rights reserved.
                </div>
            </footer>
        </div>
    )
}

function Home({ search, setSearch, filteredWorkers }) {
    const latestWorkers = filteredWorkers.slice(0, 4)

    return (
        <section className="homePage premiumHome">
            <div className="homeHeroNew">
                <div className="heroLeft">
                    <p className="heroBadge">Marketplace për shërbime</p>

                    <h1>
                        Gjej njerëzit e duhur <br />
                        për çdo punë.
                    </h1>

                    <p className="heroText">
                        Punaflow lidh bizneset dhe klientët me profesionistë
                        të verifikuar për punë cilësore dhe besueshmëri reale.
                    </p>

                    <div className="heroSearch">
                        <input
                            placeholder="Kërko elektricist, dizajner, pastruese..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button>Kërko</button>
                    </div>

                    <div className="popularTags">
                        <span>Popullare:</span>
                        <button>Elektricist</button>
                        <button>Dizajner</button>
                        <button>Hidraulik</button>
                        <button>Pastrues</button>
                        <button>Marangoz</button>
                    </div>
                </div>

                <div className="heroVisual">
                    <div className="mainWorkerCard">
                        <img
                            src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=600&q=80"
                            alt=""
                        />
                    </div>

                    <div className="smallPhoto top">
                        <img
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80"
                            alt=""
                        />
                    </div>

                    <div className="smallPhoto bottom">
                        <img
                            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=500&q=80"
                            alt=""
                        />
                    </div>

                    <div className="floatingStat">
                        <strong>120+</strong>
                        <span>Punëtorë aktivë</span>
                    </div>

                    <div className="verifiedBox">
                        <strong>Të verifikuar</strong>
                        <span>Profesionistë të besueshëm</span>
                    </div>
                </div>
            </div>

            <div className="recommendedHeader">
                <h2>Profesionistë të rekomanduar</h2>
                <a href="/workers">Shiko të gjithë →</a>
            </div>

            <div className="recommendedGrid">
                {latestWorkers.map(worker => (
                    <div className="recommendedCard" key={worker.id}>
                        {worker.logo_url && <img src={worker.logo_url} alt="" />}
                        <div>
                            <h3>{worker.full_name}</h3>
                            <p>{worker.skill}</p>
                            <span>⭐ 4.9</span>
                            <small>{worker.location}</small>
                        </div>
                    </div>
                ))}
            </div>

            <div className="homeBenefits">
                <div>
                    ✅ <strong>Profesionistë të verifikuar</strong>
                    <p>Të kontrolluar për cilësi.</p>
                </div>

                <div>
                    ⭐ <strong>Vlerësime reale</strong>
                    <p>Transparencë për çdo shërbim.</p>
                </div>

                <div>
                    💬 <strong>Komunikim i lehtë</strong>
                    <p>Lidhu direkt me profesionistin.</p>
                </div>

                <div>
                    🔒 <strong>Pagesa e sigurt</strong>
                    <p>Proces i thjeshtë dhe i mbrojtur.</p>
                </div>
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
    variant,
    children
}) {
    if (!session) {
        if (variant === 'business') {
            return (
                <section className="businessAuthPage">
                    <div className="businessIntro">
                        <h1>
                            Lidhe talentin <br />
                            me mundësinë.
                        </h1>

                        <p>
                            Punaflow është platforma që të lidh me profesionistë
                            të besueshëm për çdo projekt.
                        </p>

                        <div className="businessFeatures">
                            <div>
                                <span>👥</span>
                                <div>
                                    <h3>Punëtorë të verifikuar</h3>
                                    <p>Profesionistë të kontrolluar për cilësi dhe besueshmëri.</p>
                                </div>
                            </div>

                            <div>
                                <span>🛡</span>
                                <div>
                                    <h3>Siguri dhe besim</h3>
                                    <p>Të dhënat dhe profili i biznesit janë të sigurta.</p>
                                </div>
                            </div>

                            <div>
                                <span>⚡</span>
                                <div>
                                    <h3>Gjej shpejt & lehtë</h3>
                                    <p>Menaxho punëtorët dhe shërbimet në një vend.</p>
                                </div>
                            </div>
                        </div>

                        <div className="businessStats">
                            <div>
                                <h3>120+</h3>
                                <p>Punëtorë aktivë</p>
                            </div>

                            <div>
                                <h3>350+</h3>
                                <p>Projekte të publikuara</p>
                            </div>

                            <div>
                                <h3>4.9/5</h3>
                                <p>Vlerësime mesatare</p>
                            </div>
                        </div>
                    </div>

                    <div className="businessAuthCard">
                        <p className="eyebrow">{title}</p>
                        <h2>Kyçu ose krijo llogari</h2>

                        <p className="authSubtitle">
                            Menaxho profilin dhe punëtorët.
                        </p>

                        <div className="authInputWrap">
                            <span>✉</span>
                            <input
                                type="email"
                                placeholder="Email"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                            />
                        </div>

                        <div className="authInputWrap">
                            <span>🔒</span>
                            <input
                                type="password"
                                placeholder="Password"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                            />
                        </div>

                        <div className="authMeta">
                            <label>
                                <input type="checkbox" />
                                Më mbaj të kyçur
                            </label>

                            <a href="#">Keni harruar fjalëkalimin?</a>
                        </div>

                        <div className="authActions">
                            <button className="secondaryBtn" onClick={logIn}>
                                Log in
                            </button>

                            <button onClick={signUp}>
                                Sign up
                            </button>
                        </div>

                        <p className="termsText">
                            Duke vazhduar, ju pranoni Termat e Përdorimit dhe Politikat e Privatësisë.
                        </p>
                    </div>
                </section>
            )
        }

        return (
            <section className="premiumAuthPage">
                <div className="authCard">
                    <p className="eyebrow">{title}</p>
                    <h2>Kyçu ose krijo llogari</h2>

                    <p className="authSubtitle">
                        Kyçu në llogarinë tuaj ose krijo një të re për të vazhduar.
                    </p>

                    <div className="authInputWrap">
                        <span>✉</span>
                        <input
                            type="email"
                            placeholder="Email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                        />
                    </div>

                    <div className="authInputWrap">
                        <span>🔒</span>
                        <input
                            type="password"
                            placeholder="Password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                        />
                    </div>

                    <div className="authMeta">
                        <label>
                            <input type="checkbox" />
                            Më mbaj të kyçur
                        </label>

                        <a href="#">Keni harruar fjalëkalimin?</a>
                    </div>

                    <div className="authActions">
                        <button onClick={signUp}>Sign up</button>
                        <button className="secondaryBtn" onClick={logIn}>Log in</button>
                    </div>

                    <p className="termsText">
                        Duke vazhduar, ju pranoni Termat e Përdorimit dhe Politikat e Privatësisë.
                    </p>
                </div>
            </section>
        )
    }

    return (
        <section className="adminSection">
            <div className="sectionHeader">
                <p className="eyebrow">{title}</p>
                <h2>{heading}</h2>
                <p>Kyçur si: {session.user.email}</p>
                <button onClick={logOut}>Log out</button>
            </div>

            {children}
        </section>
    )
}

function WorkerForm({ form, setForm, addWorker, buttonText }) {
    return (
        <form onSubmit={addWorker}>
            <input placeholder="Emri" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Aftësia" value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} />
            <input placeholder="Lokacioni" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <input placeholder="Pagesa për orë" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} />
            <input placeholder="Logo URL" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />

            <textarea
                placeholder="Përshkrimi"
                value={form.about}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
            />

            <input placeholder="Portfolio 1" value={form.portfolio_image_1} onChange={(e) => setForm({ ...form, portfolio_image_1: e.target.value })} />
            <input placeholder="Portfolio 2" value={form.portfolio_image_2} onChange={(e) => setForm({ ...form, portfolio_image_2: e.target.value })} />
            <input placeholder="Portfolio 3" value={form.portfolio_image_3} onChange={(e) => setForm({ ...form, portfolio_image_3: e.target.value })} />

            <button type="submit">{buttonText}</button>
        </form>
    )
}

function WorkerGrid({ workers, deleteWorker, showDelete = false }) {
    return (
        <div className="grid">
            {workers.map(worker => (
                <div className="workerCard" key={worker.id}>
                    {worker.logo_url && (
                        <img src={worker.logo_url} alt="" className="workerLogo" />
                    )}

                    <h3>{worker.full_name}</h3>
                    <p>{worker.skill}</p>
                    <p>{worker.location}</p>
                    <p>{worker.hourly_rate} € / orë</p>

                    {showDelete && (
                        <button className="deleteBtn" onClick={() => deleteWorker(worker.id)}>
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

    const worker = workers.find(
        w => String(w.id) === id
    )

    if (!worker) {
        return (
            <section className="workersSection">
                <h2>Profili nuk u gjet.</h2>
            </section>
        )
    }

    return (

        <section className="profilePage">

            <div className="profileHeader">

                {worker.logo_url && (
                    <img
                        src={worker.logo_url}
                        alt=""
                        className="profileImage"
                    />
                )}

                <div>

                    <p className="eyebrow">
                        Punaflow Portfolio Profile
                    </p>

                    <h1>{worker.full_name}</h1>

                    <p>
                        {worker.skill} · {worker.location}
                    </p>

                    <span className="availableBadge">
                        Available
                    </span>

                </div>

            </div>

            <div className="profileDetails">

                <div>

                    <h2>Rreth profilit</h2>

                    <p>
                        {worker.about ||
                            'Ky profil ende nuk ka përshkrim.'}
                    </p>

                </div>

                <div className="profilePrice">

                    <h3>
                        {worker.hourly_rate} € / orë
                    </h3>

                    <button>
                        Kontakto
                    </button>

                </div>

            </div>

            <div className="profilePortfolio">

                {worker.portfolio_image_1 && (
                    <img src={worker.portfolio_image_1} alt="" />
                )}

                {worker.portfolio_image_2 && (
                    <img src={worker.portfolio_image_2} alt="" />
                )}

                {worker.portfolio_image_3 && (
                    <img src={worker.portfolio_image_3} alt="" />
                )}

            </div>

        </section>
    )
}
export default App