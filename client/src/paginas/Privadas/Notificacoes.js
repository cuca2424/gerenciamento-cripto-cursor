function Notificacoes() {
    return (
        <div className="container">
  <div className="d-flex overflow-auto" style={{ whiteSpace: "nowrap" }}>
    {Array.from({ length: 10 }).map((_, index) => (
      <div key={index} className="col-3 flex-shrink-0 p-2">
        <div className="card shadow-sm" style={{ width: "200px", height: "130px" }}>
          <div className="card-body d-flex align-items-center justify-content-center">
            <h5 className="card-title">Card {index + 1}</h5>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>



    )
}

export default Notificacoes;