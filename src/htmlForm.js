module.exports.htmlForm = `
  <form method="post" action="/compress" enctype="multipart/form-data">
    <input name="file" type="file"/>
    <select name="compressionType">
      <option value="gzip">gzip</option>
      <option value="deflate">deflate</option>
      <option value="br">br</option>
    </select>
    <button type="submit">submit</button>
  </form>
`;
