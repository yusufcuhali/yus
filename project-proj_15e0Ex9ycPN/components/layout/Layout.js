function Layout({ children }) {
    return (
        <div className="app-container" data-name="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
