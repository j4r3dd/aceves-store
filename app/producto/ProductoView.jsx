export default function ProductoView({ product }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{product.name}</h1>
      <img src={product.image} alt={product.name} style={{ maxWidth: '400px' }} />
      <p>{product.description}</p>
      <p>${product.price} MXN</p>
    </div>
  );
}
