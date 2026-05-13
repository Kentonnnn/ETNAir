CREATE DATABASE etnair;

/c etnair;
/*utilisateurs*/
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    user_role VARCHAR(20),
        CHECK (user_role IN ('tenant', 'owner', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
/*annonces*/
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    city NOT NULL,
    price_per_night NUMERIC(10,2) NOT NULL,
    available_from DATE,
    available_to DATE,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_listing_owner
        FOREIGN KEY(owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
/*réservations*/
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
        CHECK (status in ('pending', 'confirmed', 'cancelled')),
    user_id INTEGER NOT NULL,
    listing_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_bookings_ listings
        FOREIGN KEY(listing_id)
        REFERENCES listings(id)
        ON DELETE CASCADE
);
/*avis*/ 
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    rating INTEGER
        CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    user_id INTEGER,
    listing_id INTEGER ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_user
        FOREIGN KEY(user_id)
        REFERENCES users_id
        ON DELETE CASCADE,
    
    CONSTRAINT fk_review_listing
        FOREIGN KEY(listing_id)
        REFERENCES listings(id)
        ON DELETE CASCADE,
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status
        CHECK (payment_status in 'on hold', 'paid', 'unpaid')
    paid_at TIMESTAMP,

    CONSTRAINT fk_payment_booking
        FOREIGN KEY(listing_id)
        REFERENCES listings(id)
        ON DELETE CASCADE,
);