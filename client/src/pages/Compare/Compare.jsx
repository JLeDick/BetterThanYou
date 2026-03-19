export default function Compare() {
  return (
    <>
      <header>
        <h1>Compare Users</h1>
      </header>

      <div className="user-compare-block">
        <form onSubmit={/*compareUsers*/}>
          <label>
            User 1
            <input type="text" name="username1" required />
          </label>
          <label>
            User 2
            <input type="text" name="username2" required />
          </label>
          <button>Compare</button>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>
    </>
  )
}
