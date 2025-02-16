function Teste01() {
    return(
        <div className="col-12">
            <div className="row altura">
                <div className="p-2 pe-0 h-100 col-12 h-sm-50 col-xxl-8">
                <div className="h-100 d-flex flex-column">
                    {/* Texto que fica em cima dos blocos */}
                    <div className="col-12 order-sm-1 text-center">
                    Texto em cima
                    </div>

                    {/* Primeiro bloco */}
                    <div className="h-50 col-12 h-sm-90 col-sm-6 bg-white order-sm-2">
                    bloco 1.1
                    </div>

                    {/* Segundo bloco */}
                    <div className="h-50 col-12 h-sm-90 col-sm-6 bg-white order-sm-3">
                    bloco 1.2
                    </div>
                </div>
            </div>

                <div className="p-2 h-50 col-12 col-sm-6 col-xxl-4 bg-primary">
                    bloco 1.1
                </div>
                <div className="p-2 h-50 col-12 col-sm-6 col-xxl-4 bg-secondary">
                    bloco 1.1
                </div>
                <div className="p-2 h-50 col-12 col-sm-6 col-xxl-4 bg-danger">
                    bloco 1.1
                </div>
                <div className="p-2 h-50 col-12 col-sm-6 col-xxl-4 bg-success">
                    bloco 1.1
                </div>
            </div>
        </div>
    )
}

export default Teste01;