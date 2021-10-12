ALTER TABLE audience
ADD isFacebookVerified boolean;

ALTER TABLE message_history
ADD errors json

ALTER TABLE audience
ADD countryCode varchar(2)