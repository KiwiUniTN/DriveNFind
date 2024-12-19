import mongoose from 'mongoose';

const ParkingspotSchema = new mongoose.Schema({
  
  nome: {
    type: String,
    required: true,
  },
  indirizzo: {
    type: String,
    required: true,
  },
  tipologia: {
    type: String,
    enum: ['coperto', 'scoperto'],
    required: true,
  },
  regolamento: {
    type: String,
    required: true,
    enum: ["pagamento-disco orario", "disco orario", "gratuito senza limitazione d'orario", "pagamento"],
  },
  link: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    },
    required: true,
  },
  // Define the location as GeoJSON with 'Point' type
  location: {
    type: { 
      type: String, 
      enum: ['Point'], 
      required: true 
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  alimentazione: {
    type: String,
    enum: ['carburante', 'elettrico'],
    required: true,
  },
  disabile: {
    type: Boolean,
    required: true,
  },
  disponibilita: {
    type: String,
    enum: ['libero', 'occupato','in navigazione'],
    required: true,
  }
});

// Apply the 2dsphere index for geospatial queries on 'location'
ParkingspotSchema.index({ location: '2dsphere' });

export default mongoose.models.Parkingspot || mongoose.model('Parkingspot', ParkingspotSchema);
