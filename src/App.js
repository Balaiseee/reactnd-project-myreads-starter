import React from "react";
import { Route } from "react-router-dom";
import "./App.css";
import Dashboard from "./Dashboard.js";
import SearchBook from "./SearchBook.js";
import ToggleSearchPage from "./ToggleSearchPage.js";
import { getAll, update, search } from "./BooksAPI";

const debounce = require("lodash/debounce");

/**
 * @component App
 * @description Renders the main component of the app
 **/

class App extends React.Component {
  state = {
    books: [],
    results: []
  };

  /**
   * @memberof App
   * @method emptySearch
   * @description Empty the current result of the search in the state
   **/

  emptySearch = () => {
    this.setState({ result: [] });
  };

  /**
   * @memberof App
   * @method handleSearch
   * @description Fetch the books found by the query and store them in the state
   * @param {string} query - The title or the author of the book(s) searched
   **/

  handleSearch = async (query = "") => {
    if (query.trim() !== "") {
      const books = await search(query);
      this.setState(currentState => ({ result: books }));
    } else {
      this.emptySearch();
    }
  };

  /**
   * @memberof App
   * @method handleSearchDebounced
   * @description Fetch the books found by the query and store them in the state (wait 250ms between each call)
   * @param {string} query - The title or the author of the book(s) searched
   **/

  handleSearchDebounced = debounce(query => this.handleSearch(query), 250);

  /**
   * @memberof App
   * @method handleUpdate
   * @description Update the shelf of a book in the state of this component and in the backend server
   * @param {Object} book - The book (containing at minimum an id attribute)
   * @param {string} shelf - The new shelf for the book (contains one of ["wantToRead", "currentlyReading", "read"])
   **/

  handleUpdate = async (book, shelf) => {
    // Handle update of the shelf property of a book passed in argument with the backend server
    await update(book, shelf);
    // When the promise is resolved, update the shelf property of the book passed in argument
    book.shelf = shelf;
    // Update the book in the books state
    this.setState(currentState => ({
      books: currentState.books.filter(b => b.id !== book.id).concat(book)
    }));
  };

  async componentDidMount() {
    // Load books from the backend server and store them to the state in an array called books
    const books = await getAll();
    this.setState({ books });
  }

  render() {
    return (
      <div className="app">
        <Route exact path="/">
          <Dashboard books={this.state.books} handleUpdate={this.handleUpdate} />
          <ToggleSearchPage />
        </Route>
        <Route exact path="/search">
          <SearchBook
            books={this.state.books}
            result={this.state.result}
            emptySearch={this.emptySearch}
            handleSearch={this.handleSearchDebounced}
            handleUpdate={this.handleUpdate}
          />
        </Route>
      </div>
    );
  }
}

export default App;
