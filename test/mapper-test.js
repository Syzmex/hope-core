

/* globals describe:true it:true expect:true */
import mapper from '../src/mapper';


describe( '#mapper', () => {

  const source = { b: { c: { d: 3 }}, c: 1, 'd\\.s': 5 };
  const compiler = mapper({
    format: {
      a: '$:b.c',
      b: '$:b.c.d',
      c: '$:c',
      d: '$:d\\.s',
      e: {
        f: '$:c'
      },
      g: '$:gkhuikh'
    }
  });

  it( 'map: b.c => a', () => {
    expect( compiler( source ).a ).toEqual( source.b.c );
  });

  it( 'map: b.c.d => b', () => {
    expect( compiler( source ).b ).toEqual( source.b.c.d );
  });

  it( 'map: c => c', () => {
    expect( compiler( source ).c ).toEqual( source.c );
  });

  it( 'map: d\\.s => d', () => {
    expect( compiler( source ).d ).toEqual( source['d\\.s']);
  });

  it( 'map: c => e.f', () => {
    expect( compiler( source ).e.f ).toEqual( source.c );
  });

  it( 'map: undefined => g', () => {
    expect( compiler( source ).g ).toEqual( source.gkhuikh );
  });

});

