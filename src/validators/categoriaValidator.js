// src/validators/categoriaValidator.js  
const validateCategoria = (data) => {  
    const errors = [];  
  
    if (!data.nombre || data.nombre.trim().length < 3) {  
      errors.push('El nombre de la categoría debe tener al menos 3 caracteres');  
    }  
  
    if (data.descripcion && data.descripcion.length > 500) {  
      errors.push('La descripción no puede exceder 500 caracteres');  
    }  
  
    if (data.imagen && typeof data.imagen !== 'string') {  
      errors.push('La imagen debe ser una URL válida');  
    }  
  
    return {  
      isValid: errors.length === 0,  
      errors  
    };  
  };  
  
  const validateUniqueCategoriaName = async (nombre) => {  
    try {  
      const result = await dynamoDB.scan({  
        TableName: TABLE_NAME,  
        FilterExpression: 'nombre = :nombre',  
        ExpressionAttributeValues: {  
          ':nombre': nombre  
        }  
      }).promise();  
  
      return result.Items.length === 0;  
    } catch (error) {  
      console.error('Error validando nombre único:', error);  
      throw new Error('Error en validación de nombre');  
    }  
  };  
  
  module.exports = {   
    validateCategoria,   
    validateUniqueCategoriaName   
  };  