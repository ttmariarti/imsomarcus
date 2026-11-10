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
          pattern="^[a-zA-Zа-яА-Я]+(([' -][a-zA-Zа-яА-Я ])?[a-zA-Zа-яА-Я]*)*$"
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
          pattern="\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}"
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

export default function App() {
  const [state, setState] = useState({ contacts: [], filter: '' });

  function addContact(name, number) {
    const alreadyExists = state.contacts.some(
      contact => contact.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    );

    if (alreadyExists) {
      window.alert(`${name} вже є у телефонній книзі.`);
      return false;
    }

    setState(currentState => ({
      ...currentState,
      contacts: [
        ...currentState.contacts,
        { id: crypto.randomUUID(), name, number },
      ],
    }));
    return true;
  }

  function deleteContact(id) {
    setState(currentState => ({
      ...currentState,
      contacts: currentState.contacts.filter(contact => contact.id !== id),
    }));
  }

  const normalizedFilter = state.filter.trim().toLocaleLowerCase();
  const visibleContacts = state.contacts.filter(contact =>
    contact.name.toLocaleLowerCase().includes(normalizedFilter),
  );

  return (
    <main className="page">
      <section className="phonebook">
        <p className="eyebrow">ТВОЇ КОНТАКТИ</p>
        <h1>Телефонна книга</h1>
        <p className="intro">Збережи потрібні номери в одному місці.</p>

        <ContactForm onAddContact={addContact} />

        <section className="contacts-section" aria-labelledby="contacts-title">
          <div className="section-heading">
            <h2 id="contacts-title">Контакти</h2>
            <span className="contact-count">{state.contacts.length}</span>
          </div>

          <Filter
            value={state.filter}
            onChange={filter =>
              setState(currentState => ({ ...currentState, filter }))
            }
          />
          <ContactList contacts={visibleContacts} onDelete={deleteContact} />
        </section>
      </section>
    </main>
  );
}
