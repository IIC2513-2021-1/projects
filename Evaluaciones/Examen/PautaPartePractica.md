# Examen IIC2513 2021-1 - Solución y pauta parte práctica

**Solución backend en repositorio**: [haz click aquí](https://github.com/IIC2513-2021-1/examen-backend-solution)

**Solución frontend en repositorio**: [haz click aquí](https://github.com/IIC2513-2021-1/examen-frontend-solution)

**Solución en videos**
- [Login](https://drive.google.com/file/d/1O3XMIq1Fo7mgL2m2m97RdvAyOthJ0_Vu/view?usp=sharing)
- [Hitos históricos](https://drive.google.com/file/d/1PJCjWzjTMLIkbrr2JaAoSau_MYt9bq6U/view?usp=sharing)
- [Estadísticas generales](https://drive.google.com/file/d/1pXdMbpCJsXQjMKjXsjwSY1B7aD-42lz9/view?usp=sharing)

## Parte I: API en koa
> Puntaje: 2.0 pts

### Solución

#### Opción "Hitos históricos"
```javascript
// src/routes/api/companies.js
const CompanySerializer = new JSONAPISerializer('companies', {
  attributes: ['name', 'founder', 'foundedAt', 'description', 'imageUrl', 'summary'],
  keyForAttribute: 'camelCase',
  transform(record) {
    const { milestones } = record;
    if (milestones) {
      const { title, happenedAt, excerpt } = milestones[0];
      // eslint-disable-next-line no-param-reassign
      record.summary = { title, happenedAt, excerpt };
    }
    return record;
  },
});

const MilestoneSerializer = new JSONAPISerializer('milestones', {
  attributes: ['title', 'happenedAt', 'excerpt'],
  keyForAttribute: 'camelCase',
});

router.get('api.companies.show', '/:id', async (ctx) => {
  const company = await ctx.orm.company.findByPk(ctx.params.id, {
    include: ctx.orm.milestone,
    order: [
      ['milestones', 'happenedAt', 'DESC'],
    ],
  });
  if (!company) {
    ctx.throw(404, "The company you are looking for doesn't exist");
  }
  ctx.body = CompanySerializer.serialize(company);
});

router.get('api.companies.milestones', '/:id/milestones', async (ctx) => {
  const company = await ctx.orm.company.findByPk(ctx.params.id, {
    include: ctx.orm.milestone,
    order: [
      ['milestones', 'happenedAt', 'ASC'], // Used in frontend but could also be sorted there
    ],
  });
  if (!company) {
    ctx.throw(404, "The company you are looking for doesn't exist");
  }
  ctx.body = MilestoneSerializer.serialize(company.milestones);
});
```

#### Opción "Estadísticas generales"
```javascript
// src/routes/api/companies.js

const CompanySerializer = new JSONAPISerializer('companies', {
  attributes: ['name', 'founder', 'foundedAt', 'description', 'imageUrl', 'summary'],
  keyForAttribute: 'camelCase',
  transform(record) {
    const { stat } = record;
    if (stat) {
      const { crewedFlightOn, maxAltitude, vehicleType } = stat;
      // eslint-disable-next-line no-param-reassign
      record.summaryStats = { crewedFlightOn, maxAltitude, vehicleType };
    }
    return record;
  },
});

const StatsSerializer = new JSONAPISerializer('stats', {
  attributes: [
    'flightsQuantity',
    'vehicleType',
    'maxAltitude',
    'hasEscapeSystem',
    'crewedFlightOn',
    'requiresPilot',
    'passengersQuantity',
    'landingType',
  ],
  keyForAttribute: 'camelCase',
});

router.get('api.companies.show', '/:id', async (ctx) => {
  const company = await ctx.orm.company.findByPk(ctx.params.id, {
    include: ctx.orm.stats,
  });
  if (!company) {
    ctx.throw(404, "The company you are looking for doesn't exist");
  }
  ctx.body = CompanySerializer.serialize(company);
});

router.get('api.companies.stats', '/:id/stats', async (ctx) => {
  const company = await ctx.orm.company.findByPk(ctx.params.id, {
    include: ctx.orm.stats,
  });
  if (!company) {
    ctx.throw(404, "The company you are looking for doesn't exist");
  }
  ctx.body = StatsSerializer.serialize(company.stat);
});
```

### Distribución puntaje (aplica para cualquier opción escogida)

- **[0.5 pts]** Modificación endpoint `api.companies.show` para obtener modelo asociado
- **[0.25 pts]** Modificación `CompanySerializer` o alguna otra estrategia que permita incluir el nuevo campo `summary`
- **[0.25 pts]** Campo `summary` incluye los atributos solicitados, dependiendo de la opción escogida
- **[0.25 pts]** Definición de nuevo endpoint con método HTTP y path correctos, dependiendo de la opción escogida
- **[0.5 pts]** Consulta dentro del nuevo endpoint para obtener datos solicitados del modelo asociado
- **[0.25 pts]** Response del nuevo endpoint con status code correcto e incluye los atributos solicitados, dependiendo de la opción escogida
  - El formato queda a elección del alumno. Puede ser JSON API u otro

## Parte II: Single page application en React
> Puntaje: 2.5 pts

### Solución "Validación formulario de login"

```jsx
// src/views/Login.jsx

/* eslint-disable jsx-a11y/label-has-associated-control, react/jsx-props-no-spreading */
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Formik, useField } from 'formik';
import * as Yup from 'yup';
import authApi from '../api/auth';
import useAuth from '../hooks/useAuth';

const loginValidationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Required'),
  password: Yup.string()
    .required('Required'),
});

const Input = ({ label, ...props }) => {
  const [field, { error, touched }] = useField(props);
  const { id, name } = props;
  return (
    <div className="field">
      <label htmlFor={id || name}>{label}</label>
      <input className={touched && error ? 'input-error' : ''} {...field} {...props} />
      {touched && error && (
        <div className="field-error">{error}</div>
      )}
    </div>
  );
};

function Login() {
  const [error, setError] = useState();
  const { currentUser, handleUserLogin } = useAuth();

  const onSubmit = async (values) => {
    const { email, password } = values;
    try {
      const user = await authApi.login(email, password);
      handleUserLogin(user);
    } catch (err) {
      setError(err.message);
    }
  };

  if (currentUser) return <Redirect to="/" />;

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h1>Login Examen</h1>
        {error && (
          <div className="form-error">{error}</div>
        )}
        <Formik
          initialValues={{
            email: '',
            password: '',
          }}
          onSubmit={onSubmit}
          validationSchema={loginValidationSchema}
        >
          {({ handleSubmit, isSubmitting, isValid }) => (
            <form onSubmit={handleSubmit}>
              <Input label="E-mail" name="email" id="email" type="email" />
              <Input label="Contraseña" name="password" id="password" type="password" />
              <div className="actions">
                <button disabled={isSubmitting || !isValid} type="submit">Ingresar</button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Login;
```

```css
/* src/styles/App.css */

.input-error {
  border: 1px solid indianred;
}

.field-error {
  color: indianred;
  font-size: 0.8rem;
  font-weight: bold;
  margin-top: 5px;
}

.form-error {
  color: #721c24;
  background-color: #f8d7da;
  padding: 20px;
}
```

### Solución "Vista con lista de compañías"

```javascript
// src/api/companies.js

import config from '../config';

async function getResource(url, token) {
  const requestOptions = {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await fetch(url, requestOptions);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  const companies = await response.json();
  return companies;
}

function getCompanies(token) {
  return getResource(`${config.apiUrl}/api/companies`, token);
}

function getCompany(id, token) {
  return getResource(`${config.apiUrl}/api/companies/${id}`, token);
}

export default {
  getCompanies,
  getCompany,
};
```

```jsx
// src/components/Loading.jsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function Loading({ large = false, fullscreen = false }) {
  const className = `loading loading-${large ? 'lg' : 'sm'}`;
  const loadingComponent = <FontAwesomeIcon className={className} icon={faSpinner} />;

  if (!fullscreen) return loadingComponent;

  return (
    <div className="loading-container">
      {loadingComponent}
    </div>
  );
}
```

```jsx
// src/views/Companies.jsx

/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { Deserializer } from 'jsonapi-serializer';
import companiesApi from '../api/companies';
import Loading from '../components/Loading';
import useAuth from '../hooks/useAuth';
import CompanyCard from '../components/Companies/Card';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser: { access_token: accessToken } } = useAuth();

  useEffect(() => {
    setLoading(true);
    companiesApi.getCompanies(accessToken)
      .then((data) => {
        new Deserializer({ keyForAttribute: 'camelCase' })
          .deserialize(data, (_error, companiesList) => setCompanies(companiesList));
      })
      .catch((error) => console.log(error)) // Optional since it was not requested in the exam
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div className="companies">
      <h1>La carrera espacial privada</h1>
      {loading ? (
        <Loading large fullscreen />
      ) : (
        <ul>
          {companies.map((singleCompany) => (
            <CompanyCard key={singleCompany.id} company={singleCompany} />
          ))}
        </ul>
      )}
    </div>
  );
}
```

```css
/* src/styles/App.css */

.loading-lg {
  font-size: 4rem;
}

.companies > ul {
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
}

.companies > ul > li {
  min-height: 65vh;
  display: flex;
  flex-direction: column;
}

body {
  color: #333;
}

.companies h1 {
  text-align: center;
}

.company-main-content {
  position: relative;
}

.company-main-content .overlay {
  position: absolute;
  background: rgba(0, 0, 0, 0.4);
  margin: 0;
  color: white;
  text-align: center;
}

.company-main-content h2 {
  left: 50%;
  top: 50%;
  padding: 20px;
  width: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
}

.company-main-content p {
  left: 50%;
  bottom: 10%;
  padding: 10px;
  width: 70%;
  transform: translate(-50%, -5%);
  font-weight: bold;
}

.company-main-content img {
  width: 100%;
  height: auto;
}

.company-summary-content {
  width: 80%;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

.company-btn {
  margin: 10px 0;
}

.company-btn a {
  font-size: 1rem;
  border-radius: 0.25rem;
  padding: 10px 30px;
  border: none;
  background-color: #333;
  color: white;
  line-height: 1.5;
  cursor: pointer;
  text-decoration: none;
  box-sizing: border-box;
  display: inline-block;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 75vh;
}

.loading-sm-container {
  padding: 100px 40%;
  text-align: center;
}

@media screen and (min-width: 501px) {
  .companies > ul {
    flex-direction: row;
  }

  .companies > ul > li {
    width: 50%;
  }
}

@media screen and (min-width: 764px) {
  .login-container {
    width: 50%;
  }

  .companies > ul > li {
    min-height: 75vh;
  }
}
```

#### Opción "Hitos históricos"

```jsx
// src/views/componentes/Companies/Card.jsx

/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { Deserializer } from 'jsonapi-serializer';
import companiesApi from '../../api/companies';
import useAuth from '../../hooks/useAuth';
import Loading from '../Loading';

export default function CompanyCard({ company }) {
  const [companyResource, setCompanyResource] = useState({});
  const [loading, setLoading] = useState(false);
  const { currentUser: { access_token: accessToken } } = useAuth();
  const { summary } = companyResource;

  useEffect(() => {
    setLoading(true);
    companiesApi.getCompany(company.id, accessToken)
      .then((data) => {
        new Deserializer({ keyForAttribute: 'camelCase' })
          .deserialize(data, (_error, companyData) => setCompanyResource(companyData));
      })
      .catch((error) => console.log(error)) // Optional since it was not requested in the exam
      .finally(() => setLoading(false));
  }, [accessToken, company]);

  return (
    <li>
      <article className="company-main-content">
        <h2 className="overlay">{company.name}</h2>
        <p className="overlay">
          Founded by
          {' '}
          {company.founder}
          {' '}
          on
          {' '}
          {format(parseISO(company.foundedAt), 'PPP')}
        </p>
        <img src={company.imageUrl} alt={`${company.name} ship`} />
      </article>
      {loading ? (
        <div className="loading-sm-container">
          <Loading />
        </div>
      ) : (
        <section className="company-summary-content">
          <h3>{summary?.title}</h3>
          <span>{summary && format(parseISO(summary.happenedAt), 'PPP')}</span>
          <p>{summary?.excerpt}</p>
          <div className="company-btn">
            <Link to={`companies/${company.id}`}>Ver detalles</Link>
          </div>
        </section>
      )}
    </li>
  );
}
```

```css
/* src/styles/App.css */

.company-summary-content p {
  font-size: 0.9rem;
}
```

#### Opción "Estadísticas generales"

```jsx
// src/views/componentes/Companies/Card.jsx

/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { Deserializer } from 'jsonapi-serializer';
import companiesApi from '../../api/companies';
import useAuth from '../../hooks/useAuth';
import Loading from '../Loading';

export default function CompanyCard({ company }) {
  const [companyResource, setCompanyResource] = useState({});
  const [loading, setLoading] = useState(false);
  const { currentUser: { access_token: accessToken } } = useAuth();
  const { summary } = companyResource;

  useEffect(() => {
    setLoading(true);
    companiesApi.getCompany(company.id, accessToken)
      .then((data) => {
        new Deserializer({ keyForAttribute: 'camelCase' })
          .deserialize(data, (_error, companyData) => setCompanyResource(companyData));
      })
      .catch((error) => console.log(error)) // Optional since it was not requested in the exam
      .finally(() => setLoading(false));
  }, [accessToken, company]);

  return (
    <li>
      <article className="company-main-content">
        <h2 className="overlay">{company.name}</h2>
        <p className="overlay">
          Founded by
          {' '}
          {company.founder}
          {' '}
          on
          {' '}
          {format(parseISO(company.foundedAt), 'PPP')}
        </p>
        <img src={company.imageUrl} alt={`${company.name} ship`} />
      </article>
      {loading ? (
        <div className="loading-sm-container">
          <Loading />
        </div>
      ) : (
        <section className="company-summary-content">
          <ul className="company-summary-stats">
            <li>
              <strong>Fecha primer vuelto tripulado</strong>
              :
              {' '}
              {summary && format(parseISO(summary.crewedFlightOn), 'PPP')}
            </li>
            <li>
              <strong>Tipo de vehículo</strong>
              :
              {' '}
              {summary?.vehicleType}
            </li>
            <li>
              <strong>Altura máxima</strong>
              :
              {' '}
              {summary?.maxAltitude}
              {' '}
              kms
            </li>
          </ul>
          <div className="company-btn">
            <Link to={`companies/${company.id}`}>Ver detalles</Link>
          </div>
        </section>
      )}
    </li>
  );
}
```

```css
/* src/styles/App.css */

.company-summary-stats {
  margin: 20px 0;
  list-style-type: disc;
}

.company-summary-stats > li {
  padding: 10px 0;
  text-align: left;
}
```

### Solución "Vista detalle de compañía"

```javascript
// src/api/companies.js

function getCompanyMilestones(id, token) {
  return getResource(`${config.apiUrl}/api/companies/${id}/milestones`, token);
}

function getCompanyStats(id, token) {
  return getResource(`${config.apiUrl}/api/companies/${id}/stats`, token);
}

export default {
  getCompanyMilestones,
  getCompanyStats,
};
```

```css
/* src/styles/App.css */
.company-detail {
  width: 90%;
  margin: 0 auto;
}

.company-extended {
  display: flex;
  flex-direction: column;
}

.company-extended-item {
  width: 100%;
}

.company-extended section {
  padding-right: 20px
}

.company-extended img {
  height: auto;
  margin-top: 30px;
}

.company-extended h1 {
  font-size: 2.5rem;
}

.company-extended .company-subtitle {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 30px;
}

.company-extended section p:last-child {
  line-height: 1.5rem;
}

@media screen and (min-width: 764px) {
  .company-extended {
    flex-direction: row;
    align-items: flex-start;
  }

  .company-extended section {
    width: 40%;
  }

  .company-extended img {
    width: 60%;
  }
}
```

#### Opción "Hitos históricos"

```jsx
// src/views/CompanyDetail.jsx

/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { Deserializer } from 'jsonapi-serializer';
import companiesApi from '../api/companies';
import Loading from '../components/Loading';
import useAuth from '../hooks/useAuth';
import CompanyMilestone from '../components/Companies/Milestone';

export default function Companies() {
  const { id } = useParams();
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const { currentUser: { access_token: accessToken } } = useAuth();

  useEffect(() => {
    setLoading(true);
    companiesApi.getCompany(id, accessToken)
      .then((data) => {
        new Deserializer({ keyForAttribute: 'camelCase' })
          .deserialize(data, (_error, companyData) => setCompany(companyData));
      })
      .catch((error) => console.log(error)) // Optional since it was not requested in the exam
      .finally(() => setLoading(false));
  }, [accessToken, id]);

  useEffect(() => {
    if (Object.keys(company).length > 0) {
      setLoadingMilestones(true);
      companiesApi.getCompanyMilestones(id, accessToken)
        .then((data) => {
          new Deserializer({ keyForAttribute: 'camelCase' })
            .deserialize(data, (_error, dataArray) => setMilestones(dataArray));
        })
        .catch((error) => console.log(error)) // Optional since it was not requested in the exam
        .finally(() => setLoadingMilestones(false));
    }
  }, [accessToken, company, id]);

  return (
    <div className="company-detail">
      {loading ? (
        <Loading large fullscreen />
      ) : (
        <>
          <div className="company-extended">
            <section className="company-extended-item">
              <h1>{company.name}</h1>
              <p className="company-subtitle">
                Founded by
                {' '}
                {company.founder}
                {' '}
                on
                {' '}
                {company.foundedAt && format(parseISO(company.foundedAt), 'PPP')}
              </p>
              <p>{company.description}</p>
            </section>
            <img className="company-extended-item" src={company.imageUrl} alt={`${company.name} ship`} />
          </div>
          <div className="company-milestones">
            {loadingMilestones ? (
              <div className="loading-sm-container">
                <Loading />
              </div>
            ) : (
              <ul>
                {milestones.map((milestone) => (
                  <CompanyMilestone key={milestone.id} milestone={milestone} />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

```jsx
// src/views/components/Companies/Milestone.jsx

import React from 'react';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';

export default function CompanyMilestone({ milestone }) {
  return (
    <li className="company-milestone">
      <h3>{milestone.title}</h3>
      <span><strong>{format(parseISO(milestone.happenedAt), 'PPP')}</strong></span>
      <p>{milestone.excerpt}</p>
    </li>
  );
}
```

```css
/* src/styles/App.css */
.company-milestones ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.company-milestone {
  border-left: 10px solid #333;
  margin: 30px 0;
  padding: 10px 20px;
}

.company-milestone h3 {
  margin-top: 0;
}

.company-milestone p:last-child {
  margin-bottom: 0;
}

@media screen and (min-width: 764px) {
  .company-milestones ul {
    padding: 0 5%;
  }
}
```

#### Opción "Estadísticas generales"

```jsx
// src/views/CompanyDetail.jsx

/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { Deserializer } from 'jsonapi-serializer';
import companiesApi from '../api/companies';
import Loading from '../components/Loading';
import useAuth from '../hooks/useAuth';
import CompanyStats from '../components/Companies/Stats';

export default function Companies() {
  const { id } = useParams();
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(false);
  const { currentUser: { access_token: accessToken } } = useAuth();

  useEffect(() => {
    setLoading(true);
    companiesApi.getCompany(id, accessToken)
      .then((data) => {
        new Deserializer({ keyForAttribute: 'camelCase' })
          .deserialize(data, (_error, companyData) => setCompany(companyData));
      })
      .catch((error) => console.log(error)) // Optional since it was not requested in the exam
      .finally(() => setLoading(false));
  }, [accessToken, id]);

  useEffect(() => {
    if (Object.keys(company).length > 0) {
      setLoadingStats(true);
      companiesApi.getCompanyStats(id, accessToken)
        .then((data) => {
          new Deserializer({ keyForAttribute: 'camelCase' })
            .deserialize(data, (_error, statsData) => setStats(statsData));
        })
        .catch((error) => console.log(error)) // Optional since it was not requested in the exam
        .finally(() => setLoadingStats(false));
    }
  }, [accessToken, company, id]);

  return (
    <div className="company-detail">
      {loading ? (
        <Loading large fullscreen />
      ) : (
        <>
          <div className="company-extended">
            <section className="company-extended-item">
              <h1>{company.name}</h1>
              <p className="company-subtitle">
                Founded by
                {' '}
                {company.founder}
                {' '}
                on
                {' '}
                {company.foundedAt && format(parseISO(company.foundedAt), 'PPP')}
              </p>
              <p>{company.description}</p>
            </section>
            <img className="company-extended-item" src={company.imageUrl} alt={`${company.name} ship`} />
          </div>
          {loadingStats ? (
            <div className="loading-sm-container">
              <Loading />
            </div>
          ) : (
            <CompanyStats stats={stats} />
          )}
        </>
      )}
    </div>
  );
}
```

```jsx
// src/views/components/Companies/Stats.jsx

/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faHashtag,
  faLongArrowAltUp,
  faPlaneArrival,
  faSpaceShuttle,
  faTools,
  faUserAstronaut,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

const SingleStat = ({ icon, title, subtitle }) => (
  <div className="single-stat">
    <FontAwesomeIcon icon={icon} />
    <h3>{title}</h3>
    <span>{subtitle}</span>
  </div>
);

export default function CompanyStats({ stats }) {
  const statsMapping = useMemo(() => ({
    flightsQuantity: {
      icon: faHashtag,
      title: stats.flightsQuantity,
      subtitle: 'Cantidad de vuelos',
    },
    vehicleType: {
      icon: faSpaceShuttle,
      title: stats.vehicleType,
      subtitle: 'Tipo de vehículo',
    },
    maxAltitude: {
      icon: faLongArrowAltUp,
      title: `${stats.maxAltitude} kms`,
      subtitle: 'Altura máxima',
    },
    hasEscapeSystem: {
      icon: faExclamationTriangle,
      title: stats.hasEscapeSystem ? 'Sí' : 'No',
      subtitle: 'Tiene sistema de escape',
    },
    crewedFlightOn: {
      icon: faUserAstronaut,
      title: stats.crewedFlightOn && format(parseISO(stats.crewedFlightOn), 'PPP'),
      subtitle: 'Fecha primer vuelto tripulado',
    },
    requiresPilot: {
      icon: faTools,
      title: stats.requiresPilot ? 'Sí' : 'No',
      subtitle: 'Requiere pilotos',
    },
    passengersQuantity: {
      icon: faUsers,
      title: stats.passengersQuantity,
      subtitle: 'Cantidad de pasajeros',
    },
    landingType: {
      icon: faPlaneArrival,
      title: stats.landingType,
      subtitle: 'Tipo de aterrizaje',
    },
  }), [stats]);

  return (
    <div className="company-stats">
      <SingleStat {...statsMapping.flightsQuantity} />
      <SingleStat {...statsMapping.vehicleType} />
      <SingleStat {...statsMapping.maxAltitude} />
      <SingleStat {...statsMapping.hasEscapeSystem} />
      <SingleStat {...statsMapping.crewedFlightOn} />
      <SingleStat {...statsMapping.requiresPilot} />
      <SingleStat {...statsMapping.passengersQuantity} />
      <SingleStat {...statsMapping.landingType} />
    </div>
  );
}
```

```css
/* src/styles/App.css */
.company-stats {
  margin: 30px 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 40px;
}

.single-stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.single-stat svg {
  font-size: 2rem;
}

.single-stat h3 {
  margin: 10px 0;
}

@media screen and (min-width: 764px) {
  .company-stats {
    padding: 0 5%;
    grid-template-columns: repeat(4, 1fr);
  }
}
```


### Distribución puntaje

#### Validación formulario de login [0.5pts]
- **[0.1 pts]** Validación campo de correo requerido y que acepte sólo correos válidos
- **[0.1 pts]** Validación campo password requerido
- **[0.1 pts]** Cada campo inválido debe marcar su contorno con una tonalidad roja a gusto, y desplegar un mensaje bajo el campo que indique el mensaje de error
  - [0.05 pts] por cada campo
- **[0.1 pts]** Botón para hacer submit del formulario activado sólo si las condiciones anteriores son válidas
- **[0.1 pts]** Desplegar mensaje de error sobre el formulario, en una tonalidad roja a gusto, en caso de recibir un error desde el servidor

#### Vista con lista de compañías [1.0pt]
- **[0.1 pts]** Inicialmente mostrar título “La carrera espacial privada” y un ícono de loading grande
- **[0.2 pts]** Hacer request al endpoint “Lista de compañías” y manejar response en estados de React
- **[0.3 pts]** Una vez que la información de la lista de compañías se encuentre disponible, desplegar ambas compañías dentro de este componente, incluyendo el nombre, foto, fundador y fecha de fundación de cada compañía, además de un pequeño loading para cada caso
  - Queda a criterio del ayudante corrector asignar puntaje total o parcial de acuerdo a similitud con wireframe
- **[0.2 pts]** Para cada una de las compañías, hacer request al endpoint “Detalle de compañía” y manejar response en estados de React
- **[0.1 pts]** Una vez que la información detallada de cada compañía se encuentre disponible, desplegar en cada caso el resumen, que dependerá de opción tomada por el alumno. Es decir, deberá desplegar el resumen de hitos históricos o el de estadísticas generales.
  - Queda a criterio del ayudante corrector asignar puntaje total o parcial de acuerdo a similitud con wireframe
- **[0.1 pts]** Incluir un botón con el texto “Ver detalles” para cada compañía, que al presionarlo lleve a la ruta "/companies/:id" utilizando el componente `<Link />` de `react-router-dom`
  - Queda a criterio del ayudante corrector asignar puntaje total o parcial de acuerdo a similitud con wireframe

#### Vista detalle de compañía [1.0pt]
- **[0.1 pts]** Inicialmente mostrar un ícono de loading grande
- **[0.2 pts]** Hacer request al endpoint “Detalle de compañía” en base al id de la ruta, y manejar response en estados de React
- **[0.3 pts]** Una vez que la información detallada de la compañía se encuentre disponible, desplegar nombre, fundador, fecha de fundación, descripción y foto, según el wireframe asociado, incluyendo un ícono de loading en la parte inferior
  - Queda a criterio del ayudante corrector asignar puntaje total o parcial de acuerdo a similitud con wireframe
- **[0.2 pts]** Hacer request al endpoint implementado según opción tomada por el alumno. Es decir, consumir el endpoint “listado de hitos históricos” o “estadísticas de la compañía”, y manejar response en estados de React
- **[0.2 pts]** Una vez que la información del endpoint del punto anterior se encuentre disponible, desplegar lo siguiente según la opción tomada por el alumno:
  - Hitos históricos
    - [0.1 pts] Desplegar lista de hitos, donde cada uno incluye título, fecha y extracto. Incluir barra vertical a la izquierda
    - [0.1 pts] Hitos se deben desplegar ordenados en forma cronológica ascendente o descendente
  - Estadísticas generales
    - [0.1 pts] Desplegar todas las estadísticas en dos filas y 4 columnas
    - [0.1 pts] Incluir ícono y texto para cada estadística
  - Queda a criterio del ayudante corrector asignar puntaje total o parcial de acuerdo a similitud con wireframe

## Parte III: Calidad de software
> Puntaje: 0.5 pts

### Distribución puntaje
- **[0.25 pts]** Linter en `examen-backend` ejecuta exitosamente, sin arrojar errores ni warnings
- **[0.25 pts]** Linter en `examen-frontend` ejecuta exitosamente, sin arrojar errores ni warnings

## Parte IV: Seguridad web
> Puntaje: 1.0 pt

### Solución
Una posible solución es cambiando la consulta del usuario, aprovechando el manejo de SQL Injection que trae Sequelize:

```javascript
// src/routes/api/auth.js

// const { QueryTypes } = require('sequelize');

// ...

// const [userRecord] = await ctx.orm.sequelize.query(
//   "SELECT * from users WHERE email = '" + email + "'", // eslint-disable-line prefer-template
//   {
//     type: QueryTypes.SELECT,
//   },
// );

// if (!userRecord) ctx.throw(404, `No user found with ${email}`);
// const user = await ctx.orm.user.findByPk(userRecord.id);
const user = await ctx.orm.user.findOne({ where: { email } });
if (!user) ctx.throw(404, `No user found with ${email}`);
```
**Nota**: Las líneas modificadas se dejaron comentadas para visualizar la diferencia

Existen soluciones alternativas que tienen relación con manejar el valor del parámetro `ctx.request.body.email`, y que son igualmente válidas. Algunos ejemplos:
- No aceptar texto con algunas palabras clave como `SELECT`, `DROP`, `ALTER`, etc
- Escapar y/o sanitizar el texto para que sea considerado como un string completo, en vez de que sea parseado como parte de la consulta

### Distribución puntaje
- **[0.8 pts]** Modificación de consulta de usuario o manejo del parámetro pasado a la consulta, de forma de evitar que se parsee como parte de esta
- **[0.2 pts]** Manejo de error 404 producto de modificaciones del punto anterior
  - Si la solución no afectó el comportamiento de este error, asignar puntaje igualmente
