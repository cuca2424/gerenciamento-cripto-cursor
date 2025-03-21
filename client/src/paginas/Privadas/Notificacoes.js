import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css"; // Usa o tema do Bootstrap

function Cadastro() {
  const [telefone, setTelefone] = useState("");

  return (
    <div className="container mt-4">
      <label className="form-label">Número de Telefone</label>
      <PhoneInput
        country={"br"} 
        value={telefone}
        onChange={setTelefone}
        inputClass="form-control" 
        containerClass="w-100"
        className="" 
      />
      <p className="mt-2">Número digitado: {telefone}</p>
    </div>
  );
}

export default Cadastro;
