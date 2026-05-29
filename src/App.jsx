import { useCallback, useEffect, useState } from 'react'
import { Link, Routes, Route, useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
    const navigate = useNavigate()

    const [workers, setWorkers] = useState([])
    const [search, setSearch] = useState('')
    const [session, setSession] = useState(null)
    const [contests, setContests] = useState(() => getAllBusinessContests())
    const [authLoading, setAuthLoading] = useState(false)
    const [authPopup, setAuthPopup] = useState(null)

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

    function showAuthPopup(type, title, message) {
        setAuthPopup({ type, title, message })
    }

    async function signUp(accountType = 'independent') {
        setAuthLoading(true)

        try {
            const { error } = await supabase.auth.signUp({
                email: authEmail,
                password: authPassword,
                options: {
                    data: {
                        account_type: accountType
                    }
                }
            })

            if (error) {
                showAuthPopup('error', 'Signup nuk u krye', error.message)
                return
            }

            saveAccountRole(authEmail, accountType)
            showAuthPopup(
                'success',
                'Llogaria u krijua',
                accountType === 'business'
                    ? 'Llogaria e biznesit u krijua me sukses. Tani mund të vazhdosh te paneli i biznesit.'
                    : 'Llogaria e punëtorit u krijua me sukses. Tani mund të krijosh profilin tënd.'
            )
        } finally {
            setAuthLoading(false)
        }
    }

    async function logIn(expectedAccountType = 'independent') {
        setAuthLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: authEmail,
                password: authPassword
            })

            if (error) {
                showAuthPopup(
                    'error',
                    'Login nuk u krye',
                    expectedAccountType === 'business'
                        ? 'Nuk u gjet llogari biznesi me këto të dhëna. Krijo llogari biznesi ose provo email/password tjetër.'
                        : 'Nuk u gjet llogari punëtori me këto të dhëna. Krijo llogari punëtori ose provo email/password tjetër.'
                )
                return
            }

            const actualAccountType = inferAccountRole(data.user, authEmail, workers)

            if (!actualAccountType) {
                await supabase.auth.signOut()
                showAuthPopup(
                    'error',
                    'Kjo llogari nuk ka rol',
                    expectedAccountType === 'business'
                        ? 'Kjo llogari nuk është regjistruar si biznes. Krijo një llogari biznesi.'
                        : 'Kjo llogari nuk është regjistruar si punëtor. Krijo një llogari punëtori.'
                )
                return
            }

            if (actualAccountType !== expectedAccountType) {
                await supabase.auth.signOut()
                showAuthPopup(
                    'error',
                    'Llogari e gabuar',
                    expectedAccountType === 'business'
                        ? 'Kjo është llogari punëtori. Për biznes duhet të krijosh ose të kyçesh me llogari biznesi.'
                        : 'Kjo është llogari biznesi. Për punëtor duhet të krijosh ose të kyçesh me llogari punëtori.'
                )
            }
        } finally {
            setAuthLoading(false)
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

    async function addWorker(e, redirectAfterCreate = false) {
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

        setWorkers(prev => [data, ...prev])

        setForm({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            skill: '',
            location: '',
            hourly_rate: ''
        })

        if (redirectAfterCreate) {
            navigate(`/workers/${data.id}/dashboard`)
        } else {
            alert('Punëtori u shtua me sukses.')
        }
    }

    async function deleteWorker(id) {
        if (!session) {
            alert('Duhet të kyçeni fillimisht.')
            return
        }

        const { error } = await supabase
            .from('workers')
            .delete()
            .eq('id', id)
            .eq('user_id', session.user.id)

        if (error) {
            alert(error.message)
            return
        }

        setWorkers(prev => prev.filter(worker => worker.id !== id))
    }

    const refreshContests = useCallback(() => {
        setContests(getAllBusinessContests())
    }, [])

    const filteredWorkers = workers.filter(worker =>
        worker.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        worker.skill?.toLowerCase().includes(search.toLowerCase()) ||
        worker.location?.toLowerCase().includes(search.toLowerCase())
    )
    const independentWorker = session
        ? workers.find(worker => worker.user_id === session.user.id)
        : null
    const businessWorkers = session
        ? workers.filter(worker => worker.user_id === session.user.id)
        : []

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
                                allWorkers={workers}
                                contests={contests}
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
                                allWorkers={workers}
                            />
                        }
                    />

                    <Route
                        path="/workers/:id"
                        element={<WorkerProfile workers={workers} />}
                    />

                    <Route
                        path="/businesses/:ownerId"
                        element={<BusinessMiniSite workers={workers} />}
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
                        path="/workers/:id/dashboard"
                        element={<MyMiniWebsite workers={workers} logOut={logOut} />}
                    />

                    <Route
                        path="/independent"
                        element={
                            <IndependentEntry
                                session={session}
                                worker={independentWorker}
                                authEmail={authEmail}
                                setAuthEmail={setAuthEmail}
                                authPassword={authPassword}
                                setAuthPassword={setAuthPassword}
                                signUp={signUp}
                                logIn={logIn}
                                authLoading={authLoading}
                                logOut={logOut}
                                form={form}
                                setForm={setForm}
                                addWorker={(e) => addWorker(e, true)}
                                workers={workers}
                            />
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
                                authLoading={authLoading}
                                logOut={logOut}
                                variant="business"
                                accountType="business"
                                workers={workers}
                            >
                                <BusinessDashboard
                                    form={form}
                                    setForm={setForm}
                                    workers={businessWorkers}
                                    addWorker={(e) => addWorker(e, false)}
                                    deleteWorker={deleteWorker}
                                    session={session}
                                    onContestsChange={refreshContests}
                                    showAuthPopup={showAuthPopup}
                                />
                            </ProtectedProfilePage>
                        }
                    />
                </Routes>
            </main>

            <Footer />
            <AuthPopup popup={authPopup} onClose={() => setAuthPopup(null)} />
        </div>
    )
}

function Footer() {
    return (
        <footer className="footer">
            <div className="footerTop">
                <img src="/logo.png" alt="Punaflow Logo" className="footerLogo" />
                <p>Punaflow lidh klientët, punëtorët e pavarur dhe bizneset në një vend të thjeshtë për shërbime të sigurta.</p>
            </div>

            <div className="footerLinks">
                <div>
                    <h4>Platforma</h4>
                    <Link to="/">Ballina</Link>
                    <Link to="/workers">Kërko Punëtorë</Link>
                </div>

                <div>
                    <h4>Për punëtorë</h4>
                    <Link to="/independent">Punoj i Pavarur</Link>
                    <Link to="/business">Kam Biznes</Link>
                </div>

                <div>
                    <h4>Kontakt</h4>
                    <p>support@punaflow.com</p>
                    <p>Kosovë</p>
                </div>
            </div>

            <div className="footerBottom">
                © 2026 Punaflow. Të gjitha të drejtat e rezervuara.
            </div>
        </footer>
    )
}

function Home({ search, setSearch, filteredWorkers, allWorkers, contests }) {
    const navigate = useNavigate()
    const latestWorkers = filteredWorkers.slice(0, 4)
    const latestContests = contests.slice(0, 3)
    const suggestions = buildSearchSuggestions(search, filteredWorkers, allWorkers, contests)

    function goToSearch() {
        navigate('/workers')
    }

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
                        Punaflow lidh bizneset dhe klientët me profesionistë të verifikuar
                        për punë cilësore dhe besueshmëri reale.
                    </p>

                    <div className="heroSearch">
                        <input
                            placeholder="Kërko elektricist, dizajner, pastruese..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button onClick={goToSearch}>Kërko</button>
                        <SearchSuggestions suggestions={suggestions} />
                    </div>

                    <div className="popularTags">
                        <span>Më të kërkuarat:</span>
                        {['Elektricist', 'Dizajner', 'Hidraulik', 'Pastrues', 'Marangoz'].map(tag => (
                            <button type="button" onClick={() => setSearch(tag)} key={tag}>{tag}</button>
                        ))}
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
                <Link to="/workers">Shiko të gjithë</Link>
            </div>

            <div className="recommendedGrid">
                {latestWorkers.map(worker => (
                    <div className="recommendedCard" key={worker.id}>
                        {worker.logo_url && <img src={worker.logo_url} alt="" />}

                        <div>
                            <h3>{worker.full_name}</h3>
                            <p>{worker.skill}</p>
                            <span>★ 4.9</span>
                            <small>{worker.location}</small>
                            <Link to={`/workers/${worker.id}`}>Shiko profilin</Link>
                        </div>
                    </div>
                ))}
            </div>

            <section className="homeContests">
                <div className="recommendedHeader">
                    <div>
                        <p className="eyebrow">Konkurse</p>
                        <h2>Konkurset e fundit nga bizneset</h2>
                    </div>
                    <Link to="/business">Publiko konkurs</Link>
                </div>

                <div className="contestGrid">
                    {latestContests.map(contest => (
                        <article className="contestCard" key={contest.id}>
                            <span>{contest.businessName}</span>
                            <h3>{contest.title}</h3>
                            <p>{contest.description || 'Biznesi po kërkon kandidatë për këtë pozitë.'}</p>
                            <div>
                                <small>{contest.location || 'Lokacion fleksibil'}</small>
                                <strong>{contest.salary || 'Pagesa sipas marrëveshjes'}</strong>
                            </div>
                            {contest.ownerId && (
                                <Link to={`/businesses/${contest.ownerId}`}>Shiko biznesin</Link>
                            )}
                        </article>
                    ))}

                    {!latestContests.length && (
                        <div className="contestEmpty">
                            <h3>Ende nuk ka konkurse.</h3>
                            <p>Kur një biznes publikon konkurs, ai do shfaqet këtu në homepage.</p>
                        </div>
                    )}
                </div>
            </section>

            <div className="homeBenefits">
                <div>
                    <span className="benefitIcon">OK</span> <strong>Profesionistë të verifikuar</strong>
                    <p>Të kontrolluar për cilësi.</p>
                </div>

                <div>
                    <span className="benefitIcon">★</span> <strong>Vlerësime reale</strong>
                    <p>Transparencë për çdo shërbim.</p>
                </div>

                <div>
                    <span className="benefitIcon">MSG</span> <strong>Komunikim i lehtë</strong>
                    <p>Lidhu direkt me profesionistin.</p>
                </div>

                <div>
                    <span className="benefitIcon">SEC</span> <strong>Pagesa e sigurt</strong>
                    <p>Proces i thjeshtë dhe i mbrojtur.</p>
                </div>
            </div>
        </section>
    )
}

function WorkersPage({ search, setSearch, filteredWorkers, allWorkers }) {
    const latestWorkers = filteredWorkers.slice(0, 8)

    return (
        <section className="workersSection publicWorkersSection">
            <div className="sectionHeader publicWorkersHeader">
                <p className="eyebrow">Kërko Punëtorë</p>
                <h2>Gjej punëtorin e duhur</h2>
            </div>

            <div className="publicSearchWrap">
                <span>S</span>
                <input
                    className="search publicSearch"
                    placeholder="Kërko..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <SearchSuggestions suggestions={buildSearchSuggestions(search, filteredWorkers, allWorkers)} />
            </div>

            <PublicWorkerGrid workers={latestWorkers} allWorkers={allWorkers} />

            <div className="publicTrustBanner">
                <div className="trustIcon">OK</div>
                <div>
                    <strong>PunaFlow siguron cilësi dhe besueshmëri.</strong>
                    <p>Të gjithë punëtorët janë të verifikuar dhe të vlerësuar nga klientët tanë.</p>
                </div>
            </div>
        </section>
    )
}

function PublicWorkerGrid({ workers, allWorkers }) {
    if (!workers.length) {
        return (
            <div className="publicEmptyState">
                <h3>Nuk u gjet asnjë punëtor.</h3>
                <p>Provo një kërkim tjetër ose kontrollo më vonë për profile të reja.</p>
            </div>
        )
    }

    return (
        <div className="publicWorkerGrid">
            {workers.map(worker => (
                <Link className="publicWorkerCard" to={getPublicWorkerLink(worker, allWorkers)} key={worker.id}>
                    <div className="publicWorkerAvatar">
                        {worker.logo_url ? (
                            <img src={worker.logo_url} alt="" />
                        ) : (
                            <span>{(worker.full_name || worker.first_name || 'P').charAt(0)}</span>
                        )}
                    </div>

                    <div className="publicWorkerBody">
                        <h3>{worker.full_name || `${worker.first_name || ''} ${worker.last_name || ''}`.trim() || 'Punëtor'}</h3>

                        <p className="publicWorkerMeta">
                            <span className="metaIcon">L</span>
                            {worker.location || 'Lokacioni nuk është vendosur'}
                        </p>

                        <p className="publicWorkerMeta">
                            <span className="metaIcon">€</span>
                            {worker.hourly_rate ? `${worker.hourly_rate} € / orë` : 'Çmimi sipas marrëveshjes'}
                        </p>

                        <div className="publicWorkerDivider" />

                        <div className="publicWorkerFooter">
                            <span className="workerServiceChip">{worker.skill || 'Shërbim'}</span>
                            {worker.first_name && (
                                <span className="workerNameChip">{worker.first_name}</span>
                            )}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}

function SearchSuggestions({ suggestions }) {
    if (!suggestions.length) {
        return null
    }

    return (
        <div className="searchSuggestions">
            {suggestions.map(suggestion => (
                <Link to={suggestion.to} className="searchSuggestionItem" key={`${suggestion.type}-${suggestion.id}`}>
                    <span className={`suggestionIcon ${suggestion.type}`}>{suggestion.icon}</span>
                    <div>
                        <strong>{suggestion.title}</strong>
                        <small>{suggestion.subtitle}</small>
                    </div>
                </Link>
            ))}
        </div>
    )
}

function buildSearchSuggestions(search, workers, allWorkers, contests = []) {
    const query = search.trim().toLowerCase()

    if (query.length < 2) {
        return []
    }

    const workerSuggestions = workers
        .slice(0, 4)
        .map(worker => ({
            id: worker.id,
            type: isBusinessOwner(worker.user_id, allWorkers) ? 'business' : 'worker',
            icon: isBusinessOwner(worker.user_id, allWorkers) ? 'B' : 'P',
            title: worker.full_name || worker.skill || 'Punetor',
            subtitle: `${worker.skill || 'Sherbim'} - ${worker.location || 'Lokacion'}`,
            to: getPublicWorkerLink(worker, allWorkers)
        }))

    const contestSuggestions = contests
        .filter(contest =>
            contest.title?.toLowerCase().includes(query) ||
            contest.businessName?.toLowerCase().includes(query) ||
            contest.location?.toLowerCase().includes(query)
        )
        .slice(0, 2)
        .map(contest => ({
            id: contest.id,
            type: 'contest',
            icon: 'K',
            title: contest.title,
            subtitle: `${contest.businessName} - ${contest.location || 'Lokacion fleksibil'}`,
            to: contest.ownerId ? `/businesses/${contest.ownerId}` : '/workers'
        }))

    return [...workerSuggestions, ...contestSuggestions].slice(0, 6)
}

function getPublicWorkerLink(worker, workers) {
    if (isBusinessOwner(worker.user_id, workers)) {
        return `/businesses/${worker.user_id}`
    }

    return `/workers/${worker.id}`
}

function isBusinessOwner(ownerId, workers) {
    if (!ownerId) {
        return false
    }

    const ownerWorkers = workers.filter(item => item.user_id === ownerId)
    const hasBusinessSite = Boolean(localStorage.getItem(`punaflow-business-site-${ownerId}`))

    return ownerWorkers.length > 1 || hasBusinessSite
}

function getAllBusinessContests() {
    return Object.keys(localStorage)
        .filter(key => key.startsWith('punaflow-business-contests-'))
        .flatMap(key => {
            try {
                return JSON.parse(localStorage.getItem(key) || '[]')
            } catch {
                return []
            }
        })
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
}

function saveAccountRole(email, accountType) {
    if (!email) {
        return
    }

    localStorage.setItem(`punaflow-account-role-${email.toLowerCase()}`, accountType)
}

function getAccountRole(user, email) {
    const metadataRole = user?.user_metadata?.account_type

    if (metadataRole) {
        return metadataRole
    }

    if (!email) {
        return ''
    }

    return localStorage.getItem(`punaflow-account-role-${email.toLowerCase()}`) || ''
}

function inferAccountRole(user, email, workers = []) {
    const accountRole = getAccountRole(user, email)

    if (accountRole) {
        return accountRole
    }

    if (workers.some(worker => worker.user_id === user?.id)) {
        return 'independent'
    }

    if (localStorage.getItem(`punaflow-business-site-${user?.id}`)) {
        return 'business'
    }

    return ''
}

function isAllowedAccountType(user, expectedAccountType, workers = []) {
    const accountRole = inferAccountRole(user, user?.email, workers)

    return accountRole === expectedAccountType
}

function IndependentEntry({
    session,
    worker,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    signUp,
    logIn,
    authLoading,
    logOut,
    form,
    setForm,
    addWorker,
    workers
}) {
    const navigate = useNavigate()

    useEffect(() => {
        if (session && worker) {
            navigate(`/workers/${worker.id}/dashboard`, { replace: true })
        }
    }, [navigate, session, worker])

    if (session && worker) {
        return (
            <section className="adminSection">
                <p>Duke hapur profilin tënd...</p>
            </section>
        )
    }

    return (
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
            authLoading={authLoading}
            logOut={logOut}
            accountType="independent"
            workers={workers}
        >
            <WorkerForm
                form={form}
                setForm={setForm}
                addWorker={addWorker}
                buttonText="Krijo Profil"
            />
        </ProtectedProfilePage>
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
    authLoading,
    logOut,
    variant,
    accountType = variant === 'business' ? 'business' : 'independent',
    workers = [],
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

                        <p>Punaflow është platforma që të lidh me profesionistë të besueshëm për çdo projekt.</p>

                        <div className="businessFeatures">
                            <div>
                                <span>P</span>
                                <div>
                                    <h3>Punëtorë të verifikuar</h3>
                                    <p>Profesionistë të kontrolluar për cilësi dhe besueshmëri.</p>
                                </div>
                            </div>

                            <div>
                                <span>S</span>
                                <div>
                                    <h3>Siguri dhe besim</h3>
                                    <p>Të dhënat dhe profili i biznesit janë të sigurta.</p>
                                </div>
                            </div>

                            <div>
                                <span>F</span>
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

                    <AuthCard
                        title={title}
                        authEmail={authEmail}
                        setAuthEmail={setAuthEmail}
                        authPassword={authPassword}
                        setAuthPassword={setAuthPassword}
                        signUp={signUp}
                        logIn={logIn}
                        authLoading={authLoading}
                        accountType={accountType}
                    />
                </section>
            )
        }

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
                    authLoading={authLoading}
                    accountType={accountType}
                />
            </section>
        )
    }

    if (!isAllowedAccountType(session.user, accountType, workers)) {
        return <WrongAccountRedirect logOut={logOut} />
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

function WrongAccountRedirect({ logOut }) {
    useEffect(() => {
        logOut()
    }, [logOut])

    return (
        <section className="adminSection">
            <div className="sectionHeader">
                <p className="eyebrow">Duke hapur login...</p>
                <h2>Kjo faqe kërkon llogari tjetër.</h2>
                <p>Po të kthejmë automatikisht te forma e kyçjes.</p>
            </div>
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
    logIn,
    authLoading,
    accountType
}) {
    const accountLabel = accountType === 'business' ? 'biznesi' : 'punëtori'

    return (
        <div className="businessAuthCard authCard">
            <p className="eyebrow">{title}</p>
            <h2>Kyçu ose krijo llogari</h2>

            <p className="authSubtitle">
                Kyçu në llogarinë e {accountLabel} ose krijo një të re për të vazhduar.
            </p>

            <div className="authInputWrap">
                <span>@</span>
                <input
                    type="email"
                    placeholder="Email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                />
            </div>

            <div className="authInputWrap">
                <span>*</span>
                <input
                    type="password"
                    placeholder="Password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                />
            </div>

            <div className="authActions">
                <button disabled={authLoading} onClick={() => signUp(accountType)}>
                    {authLoading ? 'Duke u ngarkuar...' : 'Sign up'}
                </button>
                <button disabled={authLoading} className="secondaryBtn" onClick={() => logIn(accountType)}>
                    {authLoading ? 'Duke kontrolluar...' : 'Log in'}
                </button>
            </div>
        </div>
    )
}

function AuthPopup({ popup, onClose }) {
    if (!popup) {
        return null
    }

    return (
        <div className="authPopupOverlay" role="dialog" aria-modal="true">
            <div className={`authPopup ${popup.type}`}>
                <div className="authPopupIcon">{popup.type === 'success' ? 'OK' : '!'}</div>
                <div>
                    <h3>{popup.title}</h3>
                    <p>{popup.message}</p>
                    <button type="button" onClick={onClose}>Në rregull</button>
                </div>
            </div>
        </div>
    )
}

function BusinessDashboard({ form, setForm, workers, addWorker, deleteWorker, session, onContestsChange, showAuthPopup }) {
    const navigate = useNavigate()
    const businessMiniSitePath = `/businesses/${session?.user?.id}`
    const payrollKey = `punaflow-business-payroll-${session?.user?.id || 'local'}`
    const businessSiteKey = `punaflow-business-site-${session?.user?.id || 'local'}`
    const contestsKey = `punaflow-business-contests-${session?.user?.id || 'local'}`
    const [payroll, setPayroll] = useState({})
    const [contests, setContests] = useState(() => {
        const saved = localStorage.getItem(contestsKey)
        return saved ? JSON.parse(saved) : []
    })
    const [contestForm, setContestForm] = useState({
        title: '',
        description: '',
        location: '',
        salary: ''
    })
    const [businessSite, setBusinessSite] = useState(() => ({
        ...loadBusinessSite(businessSiteKey),
        email: loadBusinessSite(businessSiteKey).email || session?.user?.email || ''
    }))

    useEffect(() => {
        const saved = localStorage.getItem(payrollKey)

        if (saved) {
            queueMicrotask(() => {
                setPayroll(JSON.parse(saved))
            })
        }
    }, [payrollKey])

    useEffect(() => {
        localStorage.setItem(payrollKey, JSON.stringify(payroll))
    }, [payroll, payrollKey])

    useEffect(() => {
        localStorage.setItem(businessSiteKey, JSON.stringify(businessSite))
    }, [businessSite, businessSiteKey])

    useEffect(() => {
        const saved = localStorage.getItem(contestsKey)

        if (saved) {
            queueMicrotask(() => {
                setContests(JSON.parse(saved))
            })
        }
    }, [contestsKey])

    useEffect(() => {
        localStorage.setItem(contestsKey, JSON.stringify(contests))
        onContestsChange?.()
    }, [contests, contestsKey, onContestsChange])

    const payrollRows = workers.map(worker => {
        const settings = payroll[worker.id] || getDefaultPayroll(worker)
        const total = calculateWorkerPay(worker, settings)

        return {
            worker,
            settings,
            total
        }
    })

    const totalPayroll = payrollRows.reduce((sum, row) => sum + row.total, 0)
    const totalHours = payrollRows.reduce((sum, row) => sum + Number(row.settings.hours || 0), 0)
    const totalOvertime = payrollRows.reduce((sum, row) => sum + Number(row.settings.overtimeHours || 0), 0)
    const displayName = businessSite.name || getBusinessDisplayName(session?.user?.email)

    function updatePayroll(worker, field, value) {
        setPayroll(prev => ({
            ...prev,
            [worker.id]: {
                ...getDefaultPayroll(worker),
                ...prev[worker.id],
                [field]: value
            }
        }))
    }

    function addContest(e) {
        e.preventDefault()

        if (!contestForm.title.trim()) {
            return
        }

        setContests(prev => [
            {
                id: crypto.randomUUID(),
                ownerId: session?.user?.id,
                businessName: displayName,
                createdAt: new Date().toISOString(),
                ...contestForm
            },
            ...prev
        ])

        setContestForm({
            title: '',
            description: '',
            location: '',
            salary: ''
        })
    }

    function deleteContest(contestId) {
        setContests(prev => prev.filter(contest => contest.id !== contestId))
    }

    function handleBusinessImageUpload(field, file) {
        if (!file) {
            return
        }

        const reader = new FileReader()

        reader.onload = () => {
            setBusinessSite(prev => ({
                ...prev,
                [field]: reader.result
            }))
        }

        reader.readAsDataURL(file)
    }

    function publishBusinessSite() {
        localStorage.setItem(businessSiteKey, JSON.stringify(businessSite))
        showAuthPopup?.(
            'success',
            'Mini site u publikua',
            'Faqja publike e biznesit u ruajt. Tani po hapet mini site.'
        )
        navigate(businessMiniSitePath)
    }

    return (
        <section className="businessDashboard">
            <div className="businessHeroPanel">
                <div className="businessHeroTop">
                    <div>
                        <p className="eyebrow">Biznes</p>
                        <h1>Paneli i Biznesit</h1>
                        <p className="businessGreeting">Përshëndetje, <strong>{displayName}</strong></p>
                        <p className="businessEmail">kyçur si: {session?.user?.email}</p>
                    </div>
                    <button type="button" className="businessSiteLink" onClick={publishBusinessSite}>
                        Publiko mini site
                    </button>
                </div>

                <div className="businessStatsGrid">
                    <BusinessStat icon="P" tone="blue" value={workers.length} label="Punëtorë në sistem" />
                    <BusinessStat icon="H" tone="green" value={totalHours} label="Orë normale" />
                    <BusinessStat icon="OT" tone="yellow" value={totalOvertime} label="Orë overtime" />
                    <BusinessStat icon="€" tone="purple" value={`${totalPayroll.toFixed(2)} €`} label="Paga totale" />
                </div>
            </div>

            <section className="dashboardPanel businessSitePanel">
                <div className="payrollHeader">
                    <div>
                        <p className="eyebrow">Mini site biznesi</p>
                        <h2>Faqja publike e biznesit</h2>
                        <p>Kjo faqe hapet kur klienti kërkon një shërbim dhe rezultati është nga biznesi yt.</p>
                    </div>
                    <button type="button" className="businessSiteLink secondaryBusinessSiteLink" onClick={publishBusinessSite}>
                        Publiko mini site
                    </button>
                </div>

                <div className="businessSiteForm">
                    <input
                        placeholder="Emri i biznesit"
                        value={businessSite.name}
                        onChange={(e) => setBusinessSite({ ...businessSite, name: e.target.value })}
                    />
                    <ImageUploadField
                        label="Logo e biznesit"
                        value={businessSite.logo_url}
                        onChange={(file) => handleBusinessImageUpload('logo_url', file)}
                    />
                    <ImageUploadField
                        label="Cover i biznesit"
                        value={businessSite.cover_url}
                        onChange={(file) => handleBusinessImageUpload('cover_url', file)}
                    />
                    <input
                        placeholder="Telefon"
                        value={businessSite.phone}
                        onChange={(e) => setBusinessSite({ ...businessSite, phone: e.target.value })}
                    />
                    <input
                        placeholder="Email"
                        value={businessSite.email}
                        onChange={(e) => setBusinessSite({ ...businessSite, email: e.target.value })}
                    />
                    <textarea
                        placeholder="Përshkrimi i biznesit"
                        value={businessSite.about}
                        onChange={(e) => setBusinessSite({ ...businessSite, about: e.target.value })}
                    />
                </div>

                <MiniSiteLinkBox
                    title="Linku i mini-site të biznesit"
                    path={businessMiniSitePath}
                    onCopy={() => showAuthPopup?.('success', 'Linku u kopjua', 'Linku i mini-site u kopjua në clipboard.')}
                />
            </section>

            <section className="dashboardPanel businessContestPanel">
                <div className="payrollHeader">
                    <div>
                        <p className="eyebrow">Konkurse</p>
                        <h2>Publiko konkurs</h2>
                        <p>Konkurset që shton këtu shfaqen në homepage për kandidatët.</p>
                    </div>
                </div>

                <form className="contestForm" onSubmit={addContest}>
                    <input
                        placeholder="Titulli i konkursit"
                        value={contestForm.title}
                        onChange={(e) => setContestForm({ ...contestForm, title: e.target.value })}
                    />
                    <input
                        placeholder="Lokacioni"
                        value={contestForm.location}
                        onChange={(e) => setContestForm({ ...contestForm, location: e.target.value })}
                    />
                    <input
                        placeholder="Paga / pagesa"
                        value={contestForm.salary}
                        onChange={(e) => setContestForm({ ...contestForm, salary: e.target.value })}
                    />
                    <textarea
                        placeholder="Përshkrimi i konkursit"
                        value={contestForm.description}
                        onChange={(e) => setContestForm({ ...contestForm, description: e.target.value })}
                    />
                    <button type="submit">Publiko konkurs</button>
                </form>

                <div className="contestList">
                    {contests.map(contest => (
                        <div className="contestListItem" key={contest.id}>
                            <div>
                                <strong>{contest.title}</strong>
                                <p>{contest.location || 'Lokacion fleksibil'} · {contest.salary || 'Pagesa sipas marrëveshjes'}</p>
                            </div>
                            <button type="button" onClick={() => deleteContest(contest.id)}>Fshije</button>
                        </div>
                    ))}

                    {!contests.length && (
                        <p className="emptyText">Ende nuk ke publikuar konkurs.</p>
                    )}
                </div>
            </section>

            <div className="businessGrid refinedBusinessGrid">
                <section className="dashboardPanel businessAddPanel">
                    <div className="panelTitleRow">
                        <span className="panelIcon blueIcon">+</span>
                        <h2>Shto punëtor</h2>
                    </div>
                    <WorkerForm
                        form={form}
                        setForm={setForm}
                        addWorker={addWorker}
                        buttonText="Shto Punëtor"
                    />
                </section>

                <section className="dashboardPanel businessWorkersPanel">
                    <div className="panelTitleRow">
                        <span className="panelIcon greenIcon">P</span>
                        <h2>Punëtorët e biznesit</h2>
                    </div>
                    <BusinessWorkerList
                        workers={workers}
                        deleteWorker={deleteWorker}
                    />
                </section>
            </div>

            <section className="dashboardPanel payrollPanel">
                <div className="payrollHeader">
                    <div>
                        <p className="eyebrow">Paga dhe orë</p>
                        <h2>Payroll i punëtorëve</h2>
                        <p>Orari llogaritet automatikisht. Për punëtor me pagë fikse, përdoret paga fikse + overtime + bonus.</p>
                    </div>

                    <button type="button" className="addPayrollBtn">+ Shto pagë</button>
                </div>

                <div className="payrollTable">
                    <div className="payrollRow payrollHead">
                        <span>Punëtori</span>
                        <span>Website</span>
                        <span>Tipi</span>
                        <span>Orë</span>
                        <span>Paga fikse</span>
                        <span>Overtime</span>
                        <span>Bonus</span>
                        <span>Total</span>
                    </div>

                    {payrollRows.map(({ worker, settings, total }) => (
                        <div className="payrollRow" key={worker.id}>
                            <div className="payrollWorkerCell">
                                <WorkerAvatar worker={worker} />
                                <div>
                                    <strong>{worker.full_name}</strong>
                                    <small>{worker.skill}</small>
                                </div>
                            </div>

                            <div className="payrollLinks stackedLinks">
                                <Link to={`/workers/${worker.id}`}>Publike</Link>
                                <Link to={`/workers/${worker.id}/edit`}>Edito</Link>
                            </div>

                            <select
                                value={settings.payType}
                                onChange={(e) => updatePayroll(worker, 'payType', e.target.value)}
                            >
                                <option value="hourly">Me orë</option>
                                <option value="fixed">Pagë fikse</option>
                            </select>

                            <input
                                type="number"
                                min="0"
                                placeholder="Orë"
                                value={settings.hours}
                                disabled={settings.payType === 'fixed'}
                                onChange={(e) => updatePayroll(worker, 'hours', e.target.value)}
                            />

                            <input
                                type="number"
                                min="0"
                                placeholder="Pagë fikse"
                                value={settings.fixedSalary}
                                disabled={settings.payType === 'hourly'}
                                onChange={(e) => updatePayroll(worker, 'fixedSalary', e.target.value)}
                            />

                            <div className="overtimeInputs">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Orë OT"
                                    value={settings.overtimeHours}
                                    onChange={(e) => updatePayroll(worker, 'overtimeHours', e.target.value)}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="€/OT"
                                    value={settings.overtimeRate}
                                    onChange={(e) => updatePayroll(worker, 'overtimeRate', e.target.value)}
                                />
                            </div>

                            <input
                                type="number"
                                min="0"
                                placeholder="Bonus"
                                value={settings.bonus}
                                onChange={(e) => updatePayroll(worker, 'bonus', e.target.value)}
                            />

                            <strong>{total.toFixed(2)} €</strong>
                        </div>
                    ))}
                </div>
            </section>
        </section>
    )
}

function BusinessStat({ icon, tone, value, label }) {
    return (
        <div className="businessStatCard">
            <span className={`businessStatIcon ${tone}`}>{icon}</span>
            <div>
                <h3>{value}</h3>
                <p>{label}</p>
            </div>
        </div>
    )
}

function MiniSiteLinkBox({ title, path, onCopy }) {
    const fullLink = `${window.location.origin}${path}`

    async function copyLink() {
        await navigator.clipboard.writeText(fullLink)
        onCopy?.()
    }

    return (
        <div className="miniSiteLinkBox">
            <div>
                <p className="eyebrow">{title}</p>
                <strong>{fullLink}</strong>
            </div>
            <div className="miniSiteLinkActions">
                <Link to={path}>Hape mini site</Link>
                <button type="button" onClick={copyLink}>Kopjo linkun</button>
            </div>
        </div>
    )
}

function BusinessWorkerList({ workers, deleteWorker }) {
    if (!workers.length) {
        return <p className="emptyText">Ende nuk ka punëtorë.</p>
    }

    return (
        <div className="businessWorkerList">
            {workers.map(worker => (
                <div className="businessWorkerItem" key={worker.id}>
                    <WorkerAvatar worker={worker} />

                    <div className="businessWorkerInfo">
                        <h3>{worker.full_name}</h3>
                        <p>{worker.skill}</p>
                        <small>{worker.location}</small>
                        <strong>{worker.hourly_rate} € / orë</strong>

                        <div className="businessWorkerLinks">
                            <Link to={`/workers/${worker.id}`}>Shiko profilin</Link>
                            <Link to={`/workers/${worker.id}/edit`}>Edito</Link>
                            <Link to={`/workers/${worker.id}/edit`}>mini website</Link>
                            <Link to={`/workers/${worker.id}/dashboard`}>My mini website</Link>
                        </div>
                    </div>

                    <button className="deleteBtn compactDeleteBtn" onClick={() => deleteWorker(worker.id)}>
                        Fshije
                    </button>
                </div>
            ))}
        </div>
    )
}

function WorkerAvatar({ worker }) {
    if (worker.logo_url) {
        return <img src={worker.logo_url} alt="" className="businessWorkerAvatar" />
    }

    return (
        <div className="businessWorkerAvatar fallbackAvatar">
            {worker.full_name?.charAt(0) || 'P'}
        </div>
    )
}

function getBusinessDisplayName(email = '') {
    const name = email.split('@')[0] || 'Biznes'

    return name
        .split(/[._-]/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
}

function getDefaultPayroll(worker) {
    const hourlyRate = Number(worker.hourly_rate || 0)

    return {
        payType: 'hourly',
        hours: '',
        fixedSalary: '',
        overtimeHours: '',
        overtimeRate: hourlyRate ? String(Number((hourlyRate * 1.5).toFixed(2))) : '',
        bonus: ''
    }
}

function calculateWorkerPay(worker, settings) {
    const hourlyRate = Number(worker.hourly_rate || 0)
    const hours = Number(settings.hours || 0)
    const fixedSalary = Number(settings.fixedSalary || 0)
    const overtimeHours = Number(settings.overtimeHours || 0)
    const overtimeRate = Number(settings.overtimeRate || 0)
    const bonus = Number(settings.bonus || 0)
    const basePay = settings.payType === 'fixed'
        ? fixedSalary
        : hours * hourlyRate

    return basePay + (overtimeHours * overtimeRate) + bonus
}

function WorkerForm({ form, setForm, addWorker, buttonText }) {
    return (
        <form className="workerForm" onSubmit={addWorker}>
            <input placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <input placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input placeholder="Profession" value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })} />
            <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <input placeholder="Hourly rate" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} />

            <button type="submit">{buttonText}</button>
        </form>
    )
}

function WorkerProfile({ workers }) {
    const { id } = useParams()
    const worker = workers.find(w => String(w.id) === id)
    const [publicDashboard, setPublicDashboard] = useState({
        clients: [],
        jobs: [],
        photos: []
    })
    const [publicPlannerMonth, setPublicPlannerMonth] = useState(() => new Date().toISOString().slice(0, 7))
    const [showAllPhotos, setShowAllPhotos] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem(`punaflow-mini-dashboard-${id}`)

        if (saved) {
            queueMicrotask(() => {
                setPublicDashboard(JSON.parse(saved))
            })
        }
    }, [id])

    if (!workers.length) {
        return <h2>Duke ngarkuar profilin...</h2>
    }

    if (!worker) {
        return <h2>Profili nuk u gjet.</h2>
    }

    const galleryImages = getProfileGalleryImages(worker, publicDashboard.photos || [])

    return (
        <section className="profilePage publicProfilePage">
            <div className="publicCover">
                {worker.cover_url ? (
                    <img src={worker.cover_url} alt="" />
                ) : (
                    <div className="publicCoverFallback" />
                )}
            </div>

            <div className="publicProfileCard">
                <div className="profileHeader publicProfileHeader">
                    <div className="publicAvatar">
                        {worker.logo_url ? (
                            <img src={worker.logo_url} alt="" />
                        ) : (
                            <span>{worker.full_name?.charAt(0) || 'P'}</span>
                        )}
                    </div>

                    <div>
                        <p className="eyebrow">Punaflow Profile</p>
                        <h1>{worker.website_title || worker.full_name}</h1>
                        <p>{worker.skill} · {worker.location}</p>
                        <span className="availableBadge">Available</span>
                    </div>
                </div>

                <div className="publicProfileGrid">
                    <div className="publicAbout">
                        <h2>Rreth profilit</h2>
                        <p>{worker.about || 'Nuk ka përshkrim ende.'}</p>

                        <h2>Shërbimet</h2>
                        <p>{worker.service_description || 'Ende nuk ka përshkrim shërbimesh.'}</p>
                    </div>

                    <aside className="profilePrice publicContactCard">
                        <h3>{worker.hourly_rate} € / orë</h3>
                        <p>{worker.email}</p>
                        <p>{worker.phone}</p>

                        <Link to={`/workers/${worker.id}/edit`} className="editProfileBtn">
                            Edito mini website
                        </Link>
                    </aside>
                </div>

                <PublicPhotoGallery
                    images={galleryImages}
                    showAll={showAllPhotos}
                    onToggle={() => setShowAllPhotos(current => !current)}
                />

                <PublicAvailabilityCalendar
                    jobs={publicDashboard.jobs || []}
                    plannerMonth={publicPlannerMonth}
                    setPlannerMonth={setPublicPlannerMonth}
                />
            </div>
        </section>
    )
}

function BusinessMiniSite({ workers }) {
    const { ownerId } = useParams()
    const businessWorkers = workers.filter(worker => worker.user_id === ownerId)
    const businessSite = loadBusinessSite(`punaflow-business-site-${ownerId}`)
    const hasBusinessSite = Boolean(
        businessSite.name ||
        businessSite.logo_url ||
        businessSite.cover_url ||
        businessSite.about ||
        businessSite.phone ||
        businessSite.email
    )

    if (!businessWorkers.length && !hasBusinessSite) {
        return <h2>Biznesi nuk u gjet.</h2>
    }

    const firstWorker = businessWorkers[0] || {}
    const businessName = businessSite.name || getBusinessDisplayName(businessSite.email || firstWorker.email)
    const skills = [...new Set(businessWorkers.map(worker => worker.skill).filter(Boolean))]

    return (
        <section className="businessMiniSite">
            <div className="businessMiniCover">
                {businessSite.cover_url ? (
                    <img src={businessSite.cover_url} alt="" />
                ) : (
                    <div />
                )}
            </div>

            <div className="businessMiniCard">
                <div className="businessMiniHeader">
                    <div className="businessMiniLogo">
                        {businessSite.logo_url ? (
                            <img src={businessSite.logo_url} alt="" />
                        ) : (
                            <span>{businessName.charAt(0)}</span>
                        )}
                    </div>

                    <div>
                        <p className="eyebrow">Punaflow Business</p>
                        <h1>{businessName}</h1>
                        <p>{skills.join(' · ') || 'Shërbime profesionale'}</p>
                    </div>
                </div>

                <div className="businessMiniIntro">
                    <div>
                        <h2>Rreth biznesit</h2>
                        <p>{businessSite.about || 'Ky biznes ofron shërbime profesionale me ekip të organizuar dhe punëtorë të verifikuar.'}</p>
                    </div>

                    <aside>
                        <h3>Kontakt</h3>
                        <p>{businessSite.email || firstWorker.email || 'Email nuk është vendosur ende.'}</p>
                        <p>{businessSite.phone || firstWorker.phone || 'Telefoni nuk është vendosur ende.'}</p>
                        <strong>{businessWorkers.length} punëtorë aktivë</strong>
                    </aside>
                </div>

                <div className="businessMiniWorkersHeader">
                    <div>
                        <p className="eyebrow">Ekipi</p>
                        <h2>Punëtorët e biznesit</h2>
                    </div>
                </div>

                <div className="businessMiniWorkers">
                    {businessWorkers.map(worker => (
                        <Link to={`/workers/${worker.id}`} className="businessMiniWorkerCard" key={worker.id}>
                            <WorkerAvatar worker={worker} />
                            <div>
                                <h3>{worker.full_name}</h3>
                                <p>{worker.skill}</p>
                                <small>{worker.location}</small>
                                <strong>{worker.hourly_rate} € / orë</strong>
                            </div>
                        </Link>
                    ))}

                    {!businessWorkers.length && (
                        <div className="contestEmpty">
                            <h3>Ende nuk ka punëtorë të shtuar.</h3>
                            <p>Mini-site i biznesit është publikuar. Punëtorët do shfaqen këtu pasi t’i shtosh në panel.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

function PublicAvailabilityCalendar({ jobs, plannerMonth, setPlannerMonth }) {
    const plannerDays = buildPlannerDays(plannerMonth, jobs)
    const plannerMonthLabel = new Date(`${plannerMonth}-01T00:00:00`).toLocaleDateString('sq-AL', {
        month: 'long',
        year: 'numeric'
    })

    function changeMonth(amount) {
        const date = new Date(`${plannerMonth}-01T00:00:00`)
        date.setMonth(date.getMonth() + amount)
        setPlannerMonth(date.toISOString().slice(0, 7))
    }

    return (
        <section className="publicAvailability">
            <div className="plannerHeader">
                <div>
                    <p className="eyebrow">Disponueshmëria</p>
                    <h2>Kalendari i punës</h2>
                    <p>Ditët jeshile janë të lira. Ditët e kuqe janë të zëna me klient.</p>
                </div>

                <div className="plannerLegend">
                    <span className="freeDot">E lirë</span>
                    <span className="busyDot">E zënë</span>
                </div>
            </div>

            <div className="calendarToolbar">
                <button type="button" onClick={() => changeMonth(-1)}>
                    Muaji para
                </button>
                <strong>{plannerMonthLabel}</strong>
                <button type="button" onClick={() => changeMonth(1)}>
                    Muaji tjetër
                </button>
            </div>

            <div className="plannerGrid publicPlannerGrid">
                {['Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht', 'Die'].map(day => (
                    <strong className="plannerWeekday" key={day}>{day}</strong>
                ))}

                {plannerDays.map(day => (
                    <div className={`plannerDay publicPlannerDay ${day.kind} ${day.inMonth ? '' : 'outsideMonth'}`} key={day.date}>
                        <span>{day.label}</span>
                        {day.jobs.map(job => (
                            <em key={job.id}>{job.title}</em>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    )
}

function PublicPhotoGallery({ images, showAll, onToggle }) {
    if (!images.length) {
        return null
    }

    const visibleImages = showAll ? images : images.slice(0, 3)
    const hasMore = images.length > 3

    return (
        <section className="publicGallerySection">
            <div className="publicGalleryHeader">
                <div>
                    <p className="eyebrow">Galeria</p>
                    <h2>Fotot e punëve</h2>
                </div>

                {hasMore && (
                    <button type="button" onClick={onToggle}>
                        {showAll ? 'Shfaq më pak' : 'Shiko më shumë'}
                    </button>
                )}
            </div>

            <div className={`publicGalleryGrid ${visibleImages.length === 1 ? 'single' : ''}`}>
                {visibleImages.map((image, index) => (
                    <img src={image.src || image} alt="" key={image.id || image.src || index} />
                ))}
            </div>
        </section>
    )
}

function MiniWebsiteEditor({ workers, fetchWorkers }) {
    const navigate = useNavigate()
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
            queueMicrotask(() => {
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
            })
        }
    }, [worker])

    if (!workers.length) {
        return <h2>Duke ngarkuar profilin...</h2>
    }

    if (!worker) {
        return <h2>Profili nuk u gjet.</h2>
    }

    function handleImageUpload(field, file) {
        if (!file) {
            return
        }

        const reader = new FileReader()

        reader.onload = () => {
            setMiniSite(prev => ({
                ...prev,
                [field]: reader.result
            }))
        }

        reader.readAsDataURL(file)
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
        await fetchWorkers()
        navigate(`/workers/${worker.id}/dashboard`)
    }

    return (
        <section className="miniSiteEditor">
            <div className="sectionHeader">
                <p className="eyebrow">Mini Website</p>
                <h2>Edito profilin publik</h2>
                <p>Këtu shton logon, cover-in, përshkrimin dhe fotot e punëve.</p>
            </div>

            <form onSubmit={saveMiniSite}>
                <ImageUploadField
                    label="Logo"
                    value={miniSite.logo_url}
                    onChange={(file) => handleImageUpload('logo_url', file)}
                />

                <ImageUploadField
                    label="Cover image"
                    value={miniSite.cover_url}
                    onChange={(file) => handleImageUpload('cover_url', file)}
                />

                <input placeholder="Website title" value={miniSite.website_title} onChange={(e) => setMiniSite({ ...miniSite, website_title: e.target.value })} />

                <textarea placeholder="About" value={miniSite.about} onChange={(e) => setMiniSite({ ...miniSite, about: e.target.value })} />
                <textarea placeholder="Services" value={miniSite.service_description} onChange={(e) => setMiniSite({ ...miniSite, service_description: e.target.value })} />

                <ImageUploadField
                    label="Portfolio image 1"
                    value={miniSite.portfolio_image_1}
                    onChange={(file) => handleImageUpload('portfolio_image_1', file)}
                />

                <ImageUploadField
                    label="Portfolio image 2"
                    value={miniSite.portfolio_image_2}
                    onChange={(file) => handleImageUpload('portfolio_image_2', file)}
                />

                <ImageUploadField
                    label="Portfolio image 3"
                    value={miniSite.portfolio_image_3}
                    onChange={(file) => handleImageUpload('portfolio_image_3', file)}
                />

                <button type="submit">Ruaj mini website</button>
            </form>
        </section>
    )
}

function MyMiniWebsite({ workers, logOut }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const worker = workers.find(w => String(w.id) === id)
    const workerMiniSitePath = `/workers/${id}`
    const storageKey = `punaflow-mini-dashboard-${id}`

    const [clientForm, setClientForm] = useState({
        first_name: '',
        last_name: '',
        service: '',
        from_date: '',
        due_date: '',
        hours: '',
        payment: ''
    })

    const [plannerMonth, setPlannerMonth] = useState(() => new Date().toISOString().slice(0, 7))
    const [dashboard, setDashboard] = useState(() => loadMiniDashboard(storageKey))

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(dashboard))
    }, [dashboard, storageKey])

    if (!workers.length) {
        return <h2>Duke ngarkuar mini website...</h2>
    }

    if (!worker) {
        return <h2>Mini website nuk u gjet.</h2>
    }

    const totalHours = dashboard.jobs.reduce((sum, job) => sum + Number(job.hours || 0), 0)
    const totalPayments = dashboard.jobs.reduce((sum, job) => sum + Number(job.payment || 0), 0)
    const plannerDays = buildPlannerDays(plannerMonth, dashboard.jobs)
    const plannerMonthLabel = new Date(`${plannerMonth}-01T00:00:00`).toLocaleDateString('sq-AL', {
        month: 'long',
        year: 'numeric'
    })
    const hourlyRate = Number(worker.hourly_rate || 0)
    const upcomingJobs = dashboard.jobs
        .sort((a, b) => `${getJobStartDate(a)} ${a.time}`.localeCompare(`${getJobStartDate(b)} ${b.time}`))

    function addClient(e) {
        e.preventDefault()

        if (!clientForm.first_name.trim() || !clientForm.last_name.trim() || !clientForm.service.trim() || !clientForm.from_date) {
            return
        }

        const clientId = crypto.randomUUID()
        const fullName = `${clientForm.first_name} ${clientForm.last_name}`.trim()
        const dueDate = clientForm.due_date && clientForm.due_date >= clientForm.from_date
            ? clientForm.due_date
            : clientForm.from_date
        const client = {
            id: clientId,
            ...clientForm,
            name: fullName,
            due_date: dueDate
        }
        const job = {
            id: crypto.randomUUID(),
            client_id: clientId,
            client: fullName,
            title: clientForm.service,
            from_date: clientForm.from_date,
            due_date: dueDate,
            hours: clientForm.hours,
            payment: clientForm.payment,
            status: 'E ardhshme'
        }

        setDashboard(prev => ({
            ...prev,
            clients: [...prev.clients, client],
            jobs: [...prev.jobs, job]
        }))

        setClientForm({
            first_name: '',
            last_name: '',
            service: '',
            from_date: '',
            due_date: '',
            hours: '',
            payment: ''
        })
    }

    function removeClient(clientId) {
        setDashboard(prev => ({
            ...prev,
            clients: prev.clients.filter(client => client.id !== clientId),
            jobs: prev.jobs.filter(job => job.client_id !== clientId)
        }))
    }

    function changePlannerMonth(amount) {
        const date = new Date(`${plannerMonth}-01T00:00:00`)
        date.setMonth(date.getMonth() + amount)
        setPlannerMonth(date.toISOString().slice(0, 7))
    }

    function calculatePayment(hours) {
        const numericHours = Number(hours)

        if (!Number.isFinite(numericHours) || numericHours <= 0 || hourlyRate <= 0) {
            return ''
        }

        return String(Number((numericHours * hourlyRate).toFixed(2)))
    }

    async function handleGalleryUpload(files) {
        const selectedFiles = Array.from(files || [])

        if (!selectedFiles.length) {
            return
        }

        const uploadedPhotos = await Promise.all(
            selectedFiles.map(async file => ({
                id: crypto.randomUUID(),
                src: await readFileAsDataUrl(file),
                name: file.name
            }))
        )

        setDashboard(prev => ({
            ...prev,
            photos: [...(prev.photos || []), ...uploadedPhotos]
        }))
    }

    function removeGalleryPhoto(photoId) {
        setDashboard(prev => ({
            ...prev,
            photos: (prev.photos || []).filter(photo => photo.id !== photoId)
        }))
    }

    async function handleLogOut() {
        await logOut()
        navigate('/')
    }

    return (
        <section className="miniDashboard">
            <div className="dashboardHero miniWebsiteHero">
                <div className="miniHeroTop">
                    <div className="miniHeroIdentity">
                        <div className="miniHeroAvatar">
                            {worker.logo_url ? (
                                <img src={worker.logo_url} alt="" />
                            ) : (
                                <span>{(worker.website_title || worker.full_name || 'P').charAt(0)}</span>
                            )}
                        </div>

                        <div>
                            <p className="eyebrow">My Mini Website</p>
                            <h1>{worker.website_title || worker.full_name}</h1>
                            <p>{worker.skill} · {worker.location}</p>
                        </div>
                    </div>

                    <div className="miniHeroActions">
                        <Link to={`/workers/${worker.id}`} className="editProfileBtn">
                            Shiko faqen publike
                        </Link>
                        <Link to={`/workers/${worker.id}/edit`} className="editProfileBtn">
                            Edito mini site
                        </Link>
                        <button type="button" className="miniLogoutBtn" onClick={handleLogOut}>
                            Log out
                        </button>
                    </div>
                </div>

                <div className="dashboardStats miniHeroStats">
                    <div className="statCard">
                        <span className="dashboardStatIcon blue">C</span>
                        <div>
                            <h3>{dashboard.clients.length}</h3>
                            <p>Klientët e mi</p>
                        </div>
                    </div>

                    <div className="statCard">
                        <span className="dashboardStatIcon green">H</span>
                        <div>
                            <h3>{totalHours}</h3>
                            <p>Orë pune</p>
                        </div>
                    </div>

                    <div className="statCard">
                        <span className="dashboardStatIcon purple">€</span>
                        <div>
                            <h3>{totalPayments} €</h3>
                            <p>Pagesa</p>
                        </div>
                    </div>

                    <div className="statCard">
                        <span className="dashboardStatIcon yellow">J</span>
                        <div>
                            <h3>{upcomingJobs.length}</h3>
                            <p>Punë të ardhshme</p>
                        </div>
                    </div>
                </div>

                <MiniSiteLinkBox
                    title="Linku i mini-site tënd"
                    path={workerMiniSitePath}
                />
            </div>

            <div className="clientWorkspace miniMainGrid">
                <section className="dashboardPanel clientFormPanel">
                    <p className="eyebrow">Shto klient</p>
                    <h2>Klientët e mi</h2>
                    <form onSubmit={addClient} className="compactForm">
                        <input
                            placeholder="Emër"
                            value={clientForm.first_name}
                            onChange={(e) => setClientForm({ ...clientForm, first_name: e.target.value })}
                        />
                        <input
                            placeholder="Mbiemër"
                            value={clientForm.last_name}
                            onChange={(e) => setClientForm({ ...clientForm, last_name: e.target.value })}
                        />
                        <input
                            placeholder="Shërbimi"
                            value={clientForm.service}
                            onChange={(e) => setClientForm({ ...clientForm, service: e.target.value })}
                        />
                        <label className="fieldLabel">
                            <span>From</span>
                            <input
                                type="date"
                                value={clientForm.from_date}
                                onChange={(e) => setClientForm({ ...clientForm, from_date: e.target.value })}
                            />
                        </label>
                        <label className="fieldLabel">
                            <span>Due</span>
                            <input
                                type="date"
                                value={clientForm.due_date}
                                onChange={(e) => setClientForm({ ...clientForm, due_date: e.target.value })}
                            />
                        </label>
                        <input
                            type="number"
                            placeholder="Orë"
                            value={clientForm.hours}
                            onChange={(e) => {
                                const hours = e.target.value

                                setClientForm({
                                    ...clientForm,
                                    hours,
                                    payment: calculatePayment(hours)
                                })
                            }}
                        />
                        <input
                            type="number"
                            placeholder={hourlyRate ? `Pagesa € (${hourlyRate} €/orë)` : 'Pagesa €'}
                            value={clientForm.payment}
                            onChange={(e) => setClientForm({ ...clientForm, payment: e.target.value })}
                        />
                        <button type="submit">Shto klient</button>
                    </form>
                </section>

                <section className="dashboardPanel plannerPanel">
                    <div className="plannerHeader">
                        <div>
                            <p className="eyebrow">Planner i disponueshmërisë</p>
                            <h2>Planner i disponueshmërisë</h2>
                            <p>Ditët pa klient janë automatikisht të lira. Kur shton punë me From/Due, datat bllokohen vetë.</p>
                        </div>

                        <div className="plannerLegend">
                            <span className="freeDot">E lirë</span>
                            <span className="busyDot">E zënë me klient</span>
                        </div>
                    </div>

                    <div className="calendarToolbar">
                        <button type="button" onClick={() => changePlannerMonth(-1)}>
                            ‹
                        </button>
                        <strong>{plannerMonthLabel}</strong>
                        <button type="button" onClick={() => changePlannerMonth(1)}>
                            ›
                        </button>
                    </div>

                    <div className="plannerGrid">
                        {['Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht', 'Die'].map(day => (
                            <strong className="plannerWeekday" key={day}>{day}</strong>
                        ))}

                        {plannerDays.map(day => (
                            <div className={`plannerDay ${day.kind} ${day.inMonth ? '' : 'outsideMonth'}`} key={day.date}>
                                <span>{day.label}</span>
                                <small>{day.shortDate}</small>

                                {day.jobs.map(job => (
                                    <em key={job.id}>{job.title}</em>
                                ))}

                            </div>
                        ))}
                    </div>

                    <div className="plannerDateLists">
                        <div>
                            <h3>Datat e lira këtë muaj</h3>
                            <div className="dateTags">
                                {plannerDays
                                    .filter(day => day.kind === 'free' && day.inMonth)
                                    .slice(0, 12)
                                    .map(day => <span key={day.date}>{day.date}</span>)}
                            </div>
                        </div>

                        <div>
                            <h3>Datat e zëna këtë muaj</h3>
                            <div className="dateTags busy">
                                {plannerDays
                                    .filter(day => day.kind === 'busy' && day.inMonth)
                                    .map(day => <span key={day.date}>{day.date}</span>)}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section className="dashboardPanel clientListPanel clientHistoryPanel">
                <p className="eyebrow">Lista</p>
                <h2>Klientët</h2>
                <div className="dashboardList">
                    {dashboard.clients.map(client => (
                        <div className="dashboardListItem" key={client.id}>
                            <div>
                                <strong>{client.name}</strong>
                                <p>{client.service}</p>
                                <small>{formatJobDateRange(client)} · {client.hours || 0} orë · {client.payment || 0} €</small>
                            </div>
                            <button type="button" onClick={() => removeClient(client.id)}>
                                Fshije
                            </button>
                        </div>
                    ))}

                    {!dashboard.clients.length && (
                        <p className="emptyText">Ende nuk ke klientë të shtuar.</p>
                    )}
                </div>
            </section>

            <section className="dashboardPanel privateGalleryPanel">
                <div className="privateGalleryHeader">
                    <div>
                        <p className="eyebrow">Fotot e punëve</p>
                        <h2>Galeria për faqen publike</h2>
                        <p>Këtu mund të shtosh foto. Në linkun publik nuk shfaqet upload-i, vetëm galeria.</p>
                    </div>

                    <label className="galleryUploadButton">
                        + Shto foto
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleGalleryUpload(e.target.files)}
                        />
                    </label>
                </div>

                <div className="privateGalleryGrid">
                    {(dashboard.photos || []).map(photo => (
                        <div className="privateGalleryItem" key={photo.id}>
                            <img src={photo.src} alt="" />
                            <button type="button" onClick={() => removeGalleryPhoto(photo.id)}>
                                Hiq
                            </button>
                        </div>
                    ))}

                    {!(dashboard.photos || []).length && (
                        <p className="emptyText">Ende nuk ke shtuar foto.</p>
                    )}
                </div>
            </section>
        </section>
    )
}

function buildPlannerDays(plannerMonth, jobs) {
    const monthStart = new Date(`${plannerMonth}-01T00:00:00`)
    const plannerStart = new Date(monthStart)

    plannerStart.setDate(monthStart.getDate() - ((monthStart.getDay() + 6) % 7))

    return Array.from({ length: 42 }, (_, index) => {
        const current = new Date(plannerStart)
        current.setDate(plannerStart.getDate() + index)

        const date = current.toISOString().slice(0, 10)
        const dayJobs = jobs.filter(job => isDateWithinJob(date, job))
        const isBusy = dayJobs.length > 0

        return {
            date,
            jobs: dayJobs,
            kind: isBusy ? 'busy' : 'free',
            inMonth: date.startsWith(plannerMonth),
            label: current.getDate(),
            shortDate: current.toLocaleDateString('sq-AL', {
                month: 'short'
            })
        }
    })
}

function getJobStartDate(job) {
    return job.from_date || job.date || ''
}

function getJobEndDate(job) {
    return job.due_date || job.date || job.from_date || ''
}

function isDateWithinJob(date, job) {
    const start = getJobStartDate(job)
    const end = getJobEndDate(job)

    if (!start) {
        return false
    }

    return date >= start && date <= (end || start)
}

function formatJobDateRange(job) {
    const start = getJobStartDate(job)
    const end = getJobEndDate(job)

    if (!end || start === end) {
        return start
    }

    return `${start} - ${end}`
}

function loadMiniDashboard(storageKey) {
    const fallback = {
        clients: [],
        jobs: [],
        freeDates: [],
        busyDates: [],
        photos: []
    }

    try {
        return {
            ...fallback,
            ...JSON.parse(localStorage.getItem(storageKey) || '{}')
        }
    } catch {
        return fallback
    }
}

function loadBusinessSite(storageKey) {
    const fallback = {
        name: '',
        logo_url: '',
        cover_url: '',
        about: '',
        phone: '',
        email: ''
    }

    try {
        return {
            ...fallback,
            ...JSON.parse(localStorage.getItem(storageKey) || '{}')
        }
    } catch {
        return fallback
    }
}

function getProfileGalleryImages(worker, dashboardPhotos) {
    return [
        worker.portfolio_image_1,
        worker.portfolio_image_2,
        worker.portfolio_image_3,
        ...dashboardPhotos
    ].filter(Boolean)
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

function ImageUploadField({ label, value, onChange }) {
    return (
        <label className="imageUploadField">
            <span>{label}</span>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => onChange(e.target.files?.[0])}
            />
            {value && <img src={value} alt="" className="uploadPreview" />}
        </label>
    )
}

export default App


