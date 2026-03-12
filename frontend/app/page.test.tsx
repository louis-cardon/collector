import { render, screen } from '@testing-library/react';

import Home from './page';

describe('Home page', () => {
  it('renders the project heading', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { name: /Collector\.shop/i }),
    ).toBeInTheDocument();
  });
});
