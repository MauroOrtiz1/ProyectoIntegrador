const validateProducto = (data) => {  
    const errors = [];  
    
    if (!data.nombre || data.nombre.length < 3) {  
      errors.push('Nombre inválido');  
    }  
    
    if (!data.precio || isNaN(parseFloat(data.precio)) || parseFloat(data.precio) <= 0) {  
      errors.push('Precio inválido');  
    }  
    
    if (!data.cantidad || isNaN(parseInt(data.cantidad)) || parseInt(data.cantidad) < 0) {  
      errors.push('Cantidad inválida');  
    }  
    
    return {  
      isValid: errors.length === 0,  
      errors  
    };  
  };  
  
  module.exports = { validateProducto };  