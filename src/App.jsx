import React, { useState } from 'react';

function ContactForm({ onAddContact }) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (onAddContact(name.trim(), number.trim())) {
      setName('');
      setNumber('');
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Ім’я</span>
        <input
          type="text"
          name="name"
          pattern="^[a-zA-Zа-яА-Я]+(([' \x2d][a-zA-Zа-яА-Я ])?[a-zA-Zа-яА-Я]*)*$"
          title="Ім’я може містити лише літери, апостроф, дефіс і пробіли."
          value={name}
          onChange={event => setName(event.target.value)}
          required
        />
      </label>

      <label className="field">
        <span>Номер телефону</span>
        <input
          type="tel"
          name="number"
          pattern="\+?\d{1,4}?[\x2d.\s]?\(?\d{1,3}?\)?[\x2d.\s]?\d{1,4}[\x2d.\s]?\d{1,4}[\x2d.\s]?\d{1,9}"
          title="Номер має містити цифри; можна використовувати пробіли, дефіси, дужки та +."
          value={number}
          onChange={event => setNumber(event.target.value)}
          required
        />
      </label>

      <button className="add-button" type="submit">
        Додати контакт
      </button>
    </form>
  );
}

function Filter({ value, onChange }) {
  return (
    <label className="field search-field">
      <span>Пошук за ім’ям</span>
      <input
        type="text"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="Наприклад, Марія"
      />
    </label>
  );
}

function ContactItem({ contact, onDelete }) {
  return (
    <li className="contact-item">
      <div>
        <p className="contact-name">{contact.name}</p>
        <a className="contact-number" href={`tel:${contact.number}`}>
          {contact.number}
        </a>
      </div>
      <button
        className="delete-button"
        type="button"
        onClick={() => onDelete(contact.id)}
        aria-label={`Видалити контакт ${contact.name}`}
      >
        Видалити
      </button>
    </li>
  );
}

function ContactList({ contacts, onDelete }) {
  if (contacts.length === 0) {
    return <p className="empty-message">Контактів поки немає.</p>;
  }

  return (
    <ul className="contact-list">
      {contacts.map(contact => (
        <ContactItem
          key={contact.id}
          contact={contact}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { contacts: [], filter: '' };
    this.addContact = this.addContact.bind(this);
    this.deleteContact = this.deleteContact.bind(this);
  }

  componentDidMount() {
    try {
      const savedContacts = localStorage.getItem('contacts');

      if (savedContacts === null) {
        return;
      }

      const contacts = JSON.parse(savedContacts);
      const validContacts =
        Array.isArray(contacts) &&
        contacts.every(
          contact =>
            contact &&
            typeof contact.id === 'string' &&
            typeof contact.name === 'string' &&
            typeof contact.number === 'string',
        );

      if (!validContacts) {
        throw new TypeError('Збережені контакти мають неправильний формат.');
      }

      this.setState({ contacts });
    } catch (error) {
      console.error('Не вдалося завантажити контакти з localStorage.', error);
    }
  }

  componentDidUpdate(previousProps, previousState) {
    if (previousState.contacts === this.state.contacts) {
      return;
    }

    try {
      localStorage.setItem('contacts', JSON.stringify(this.state.contacts));
    } catch (error) {
      console.error('Не вдалося зберегти контакти в localStorage.', error);
    }
  }

  addContact(name, number) {
    const alreadyExists = this.state.contacts.some(
      contact => contact.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    );

    if (alreadyExists) {
      window.alert(`${name} вже є у телефонній книзі.`);
      return false;
    }

    this.setState(currentState => ({
      ...currentState,
      contacts: [
        ...currentState.contacts,
        { id: crypto.randomUUID(), name, number },
      ],
    }));
    return true;
  }

  deleteContact(id) {
    this.setState(currentState => ({
      ...currentState,
      contacts: currentState.contacts.filter(contact => contact.id !== id),
    }));
  }

  render() {
    const normalizedFilter = this.state.filter.trim().toLocaleLowerCase();
    const visibleContacts = this.state.contacts.filter(contact =>
      contact.name.toLocaleLowerCase().includes(normalizedFilter),
    );

    return (
      <main className="page">
        <section className="phonebook">
          <p className="eyebrow">ТВОЇ КОНТАКТИ</p>
          <h1>Телефонна книга</h1>
          <p className="intro">Збережи потрібні номери в одному місці.</p>

          <ContactForm onAddContact={this.addContact} />

          <section className="contacts-section" aria-labelledby="contacts-title">
            <div className="section-heading">
              <h2 id="contacts-title">Контакти</h2>
              <span className="contact-count">{this.state.contacts.length}</span>
            </div>

            <Filter
              value={this.state.filter}
              onChange={filter => this.setState({ filter })}
            />
            <ContactList
              contacts={visibleContacts}
              onDelete={this.deleteContact}
            />
          </section>
        </section>
      </main>
    );
  }
}
